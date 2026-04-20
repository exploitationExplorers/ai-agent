import { forwardRef, Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobAgentService } from 'src/ai/job-agent.service';
import { ToolModule } from 'src/tool/tool.module';
@Module({
  providers: [JobService, JobAgentService],
  imports: [forwardRef(() => ToolModule)],
  exports: [JobService],
})
export class JobModule {}
