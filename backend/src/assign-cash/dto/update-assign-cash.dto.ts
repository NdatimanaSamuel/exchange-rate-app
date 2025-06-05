import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignCashDto } from './create-assign-cash.dto';

export class UpdateAssignCashDto extends PartialType(CreateAssignCashDto) {}
