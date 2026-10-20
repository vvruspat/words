import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	jest,
} from "@jest/globals";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { QueryFailedError } from "typeorm";
import { REPORT_REPOSITORY } from "../constants/database.constants";
import { GlobalExceptionFilter } from "../filters/global.filter";
import { ReportController } from "./report.controller";
import { ReportService } from "./report.service";

describe("POST /report", () => {
	let app: INestApplication;
	const wordConstraint = "report_word_fk";
	const repository = {
		create: jest.fn((report: object) => report),
		save: jest.fn<(report: object) => Promise<object>>(),
		metadata: {
			foreignKeys: [
				{
					name: wordConstraint,
					columns: [{ propertyName: "word" }],
				},
			],
		},
	};
	const payload = { word: 1408, type: "audio" };
	const savedReport = {
		id: 1,
		created_at: "2026-10-20T15:42:10.000Z",
		...payload,
		status: "new",
	};

	function databaseError(code: string, constraint?: string) {
		return new QueryFailedError(
			"INSERT INTO report",
			[],
			Object.assign(new Error("Database write failed"), { code, constraint }),
		);
	}

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			controllers: [ReportController],
			providers: [
				ReportService,
				{ provide: REPORT_REPOSITORY, useValue: repository },
			],
		}).compile();
		app = module.createNestApplication({ logger: false });
		app.useGlobalFilters(new GlobalExceptionFilter());
		await app.init();
	});

	beforeEach(() => {
		jest.clearAllMocks();
		repository.save.mockResolvedValue(savedReport);
	});

	afterAll(async () => {
		await app.close();
	});

	it("saves a report for an existing word", async () => {
		const response = await request(app.getHttpServer())
			.post("/report")
			.send(payload)
			.expect(201);

		expect(response.body).toEqual(savedReport);
		expect(repository.save).toHaveBeenCalledWith(payload);
	});

	it("returns 404 when the word is missing at save time", async () => {
		repository.save.mockRejectedValue(databaseError("23503", wordConstraint));

		const response = await request(app.getHttpServer())
			.post("/report")
			.send(payload)
			.expect(404);

		expect(response.body).toEqual({
			status: "error",
			error: { statusCode: 404, message: "Word not found" },
		});
	});

	it.each([
		["an unrelated foreign key", databaseError("23503", "report_other_fk")],
		["a unique constraint", databaseError("23505", wordConstraint)],
		["a connection failure", new Error("Connection closed")],
	])("keeps %s as a server error", async (_name, error) => {
		repository.save.mockRejectedValue(error);

		const response = await request(app.getHttpServer())
			.post("/report")
			.send(payload)
			.expect(500);

		expect(response.body).toEqual({
			status: "error",
			error: { statusCode: 500, message: "Internal server error" },
		});
	});

	it("rejects an invalid report before writing to the database", async () => {
		await request(app.getHttpServer())
			.post("/report")
			.send({ word: "1408", type: "invalid" })
			.expect(400);

		expect(repository.save).not.toHaveBeenCalled();
	});
});
