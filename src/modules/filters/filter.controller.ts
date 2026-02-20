import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ToolsFilterService } from './filter.service';
import { FilterQueryObject } from './filter-query/filter-query';
import { GlobalSearchQueryDto } from './dto/global-search-query.dto';

// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Filters')
@Controller('filters')
export class FiltersController {
  constructor(private readonly toolsFilterService: ToolsFilterService) {}

  // ==================== GET AVAILABLE FILTERS ====================

  // GET /filters/tools
  @Get('tools')
  @ApiOperation({ summary: 'Get all available filters for tools' })
  async getToolFilters() {
    return this.toolsFilterService.getFilters();
  }

  // ==================== APPLY FILTERS ====================


//   {
//   "limit": 20,
//   "page": 1,
//   "sort": {
//     "orderBy": "createdAt",
//     "order": "desc"
//   },
//   "filters": [
              
//         {
//       "op": "between",
//       "path": "averageRating",
//       "value": {
//         "start": 0,
//         "end": 5
//       }
//       }      
//     ]
// }


// {
//   "filters": [
//     {
//       "op": "in",
//       "path": "categories.category.slug",
//       "value": ["chatbots", "writing"]
//     }
//   ]
// }

// {
//       "op": "in",
//       "path": "targetAudience",
//       "value": ["DEVELOPERS"]
//     },

  // POST /filters/tools/search
  @Post('tools/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search tools with advanced filters' })
  @ApiBody({ type: FilterQueryObject })
  async searchTools(@Body() filterQuery: FilterQueryObject) {
    return this.toolsFilterService.findMany(filterQuery);
  }




  // ==================== GLOBAL SEARCH ====================

  // GET /filters/tools/global-search?prompt=chatgpt&all=true
  @Get('tools/global-search')
  @ApiOperation({ summary: 'Quick search across all tool fields' })
  @ApiQuery({ name: 'prompt', required: true, type: String, description: 'Search term' })
  @ApiQuery({ name: 'all', required: false, type: Boolean, description: 'Search all fields (default: true)' })
  @ApiQuery({ name: 'name', required: false, type: Boolean, description: 'Search only in name' })
  @ApiQuery({ name: 'tagline', required: false, type: Boolean, description: 'Search only in tagline' })
  @ApiQuery({ name: 'description', required: false, type: Boolean, description: 'Search only in description' })
  @ApiQuery({ name: 'aiModel', required: false, type: Boolean, description: 'Search only in AI model' })
  @ApiQuery({ name: 'platformType', required: false, type: [String], description: 'Filter by platform type' })
  @ApiQuery({ name: 'targetAudience', required: false, type: [String], description: 'Filter by target audience' })
  @ApiQuery({ name: 'categories', required: false, type: [String], description: 'Filter by category slugs' })
  @ApiQuery({ name: 'tags', required: false, type: [String], description: 'Filter by tag slugs' })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean, description: 'Only published tools' })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean, description: 'Only featured tools' })
  @ApiQuery({ name: 'isVerified', required: false, type: Boolean, description: 'Only verified tools' })
  async globalSearch(@Query() query: GlobalSearchQueryDto) {
    console.log("...........................")
    return this.toolsFilterService.globalSearch(query);
  }
}