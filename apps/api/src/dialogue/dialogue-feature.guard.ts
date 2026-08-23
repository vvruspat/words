import {
	CanActivate,
	ExecutionContext,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DialogueFeatureGuard implements CanActivate {
	constructor(private readonly config: ConfigService) {}

	canActivate(_context: ExecutionContext) {
		if (this.config.get<string>("DIALOGUE_FEATURE_ENABLED") === "false") {
			throw new NotFoundException("Dialogue feature is not enabled");
		}
		return true;
	}
}
