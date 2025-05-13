import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {MarketplaceItem} from '@/types/marketplace';
import {formatDistanceToNow, isValid} from 'date-fns';
import cryptoIcon from '@/assets/icons/crypto.png';
import {Clock, Eye, Sparkles, Tag, User} from 'lucide-react';
import {getListingTypeInfo} from '@/utils/marketplaceUtils';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  viewMode: 'grid' | 'list';
}

export function MarketplaceItemCard({
  item,
  viewMode,
}: MarketplaceItemCardProps) {
  const isGrid = viewMode === 'grid';
  const typeInfo = getListingTypeInfo(item);

  // Function to safely format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';

    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'Invalid date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Function to get level badge color and icon
  const getLevelBadge = (level?: string) => {
    if (!level) return null;

    let color = '';
    let darkColor = '';
    let icon = null;

    switch (level.toLowerCase()) {
      case 'beginner':
        color =
          'bg-green-100 text-green-800 hover:bg-green-200 border-green-300';
        darkColor =
          'dark:bg-green-900/40 dark:text-green-300 dark:border-green-700';
        icon = '🌱'; // Seedling for beginners
        break;
      case 'intermediate':
        color =
          'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300';
        darkColor =
          'dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700';
        icon = '🌿'; // Growing plant for intermediate
        break;
      case 'advanced':
        color = 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300';
        darkColor = 'dark:bg-red-900/40 dark:text-red-300 dark:border-red-700';
        icon = '🌳'; // Full tree for advanced
        break;
      default:
        color = 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300';
        darkColor = 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
        icon = '📚';
    }

    return (
      <Badge
        variant="outline"
        className={`${color} ${darkColor} font-medium shadow-sm`}
      >
        <span className="mr-1">{icon}</span> {level}
      </Badge>
    );
  };

  // Function to format view count with proper pluralization and styling
  const formatViewCount = (views?: number) => {
    if (views === undefined || views === null) return '0 views';

    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k ${
        views === 1000 ? 'view' : 'views'
      }`;
    }

    return `${views} ${views === 1 ? 'view' : 'views'}`;
  };

  // Grid view
  if (isGrid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
        whileHover={{ y: -5 }}
      >
        <Link to={`/marketplace/item/${item._id}`} className="block h-full">
          <Card className="overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 border-2 border-border/40 dark:border-primary/20 group hover:border-primary/30 dark:hover:border-primary/40">
            <div className="relative">
              {item.imagesUrl && item.imagesUrl.length > 0 ? (
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.imagesUrl[0]}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/30 flex items-center justify-center">
                  <div className="text-5xl opacity-40 dark:opacity-60">
                    {typeInfo.icon}
                  </div>
                </div>
              )}

              {/* Overlay with type badge and view count */}
              <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-end">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-indigo-600 dark:bg-indigo-500 text-white shadow-md backdrop-blur-sm"
                  >
                    <span>{typeInfo.icon}</span>
                    <span className="text-xs font-medium">
                      {typeInfo.label}
                    </span>
                  </Badge>
                </div>

                {item.views && item.views > 0 && (
                  <div className="flex justify-end">
                    <Badge
                      variant="secondary"
                      className="bg-white/90 dark:bg-slate-700 dark:text-white text-black font-medium shadow-sm backdrop-blur-sm"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {formatViewCount(item.views)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-grow flex flex-col">
              <CardHeader className="pb-2 pt-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-lg font-bold bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded-md">
                    <img src={cryptoIcon} alt="Credits" className="h-4 w-4" />
                    {Math.round(item.price)}
                  </div>
                </div>
                <CardDescription className="line-clamp-2 mt-1 dark:text-slate-300">
                  {item.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-2 flex-grow">
                {/* Proficiency level and skill */}
                <div className="space-y-2 mb-3">
                  {item.proficiencyLevel && (
                    <div className="flex items-center gap-1">
                      {getLevelBadge(item.proficiencyLevel)}
                    </div>
                  )}
                  {item.skillName && (
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700 flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        {item.skillName}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                      >
                        +{item.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0 text-xs text-muted-foreground   ">
                <div className="w-full flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.seller?.name || 'Unknown seller'}
                  </div>
                </div>
              </CardFooter>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  }

  // List view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ x: 5 }}
    >
      <Link to={`/marketplace/item/${item._id}`}>
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-border/40 dark:border-primary/20 group hover:border-primary/30 dark:hover:border-primary/40">
          <div className="flex">
            <div className="relative w-32 h-32 sm:w-48 sm:h-48">
              {item.imagesUrl && item.imagesUrl.length > 0 ? (
                <img
                  src={item.imagesUrl[0]}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/30 flex items-center justify-center">
                  <div className="text-4xl opacity-40 dark:opacity-60">
                    {typeInfo.icon}
                  </div>
                </div>
              )}

              {/* Type badge overlay */}
              <div className="absolute top-2 right-2">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-indigo-600 dark:bg-indigo-500 text-white shadow-md text-xs backdrop-blur-sm"
                >
                  <span>{typeInfo.icon}</span>
                </Badge>
              </div>

              {/* View count overlay */}
              {item.views && item.views > 0 && (
                <div className="absolute bottom-2 right-2">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 dark:bg-slate-700 dark:text-white text-black font-medium shadow-sm text-xs backdrop-blur-sm"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {formatViewCount(item.views)}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1 dark:text-slate-300">
                      {item.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-lg font-bold bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded-md whitespace-nowrap">
                    <img src={cryptoIcon} alt="Credits" className="h-4 w-4" />
                    {Math.round(item.price)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="py-0 flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.proficiencyLevel &&
                    getLevelBadge(item.proficiencyLevel)}

                  {item.skillName && (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700 flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      {item.skillName}
                    </Badge>
                  )}

                  {item.category && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700 flex items-center gap-1"
                    >
                      <Tag className="h-3 w-3" />
                      {item.category}
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.tags.slice(0, 5).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 5 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                      >
                        +{item.tags.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0 text-xs text-muted-foreground">
                <div className="w-full flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </div>
                </div>
              </CardFooter>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
