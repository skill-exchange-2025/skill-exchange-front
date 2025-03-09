import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketplaceItem } from '@/types/marketplace';
import { formatDistanceToNow, isValid } from 'date-fns';
import cryptoIcon from '@/assets/icons/crypto.png';
import {
  Eye,
  Clock,
  Tag,
  User,
  GraduationCap,
  Star,
  Sparkles,
} from 'lucide-react';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  viewMode: 'grid' | 'list';
}

export function MarketplaceItemCard({
  item,
  viewMode,
}: MarketplaceItemCardProps) {
  const isGrid = viewMode === 'grid';

  // Function to safely format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';

    try {
      const date = new Date(dateString);
      if (!isValid(date)) {
        return 'Invalid date';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  // Function to get level badge variant and class
  const getLevelBadge = (level: string) => {
    const normalizedLevel = level.toLowerCase();
    if (normalizedLevel.includes('advanced')) {
      return {
        variant: 'destructive' as const,
        className: 'bg-red-500 hover:bg-red-600',
        icon: Sparkles,
        color: 'text-purple-500',
      };
    }
    if (normalizedLevel.includes('intermediate')) {
      return {
        variant: 'destructive' as const,
        className: 'bg-orange-500 hover:bg-orange-600',
        icon: Star,
        color: 'text-yellow-500',
      };
    }
    if (normalizedLevel.includes('beginner')) {
      return {
        variant: 'destructive' as const,
        className: 'bg-green-500 hover:bg-green-600',
        icon: GraduationCap,
        color: 'text-blue-500',
      };
    }
    return {
      variant: 'secondary' as const,
      className: 'bg-gray-500 hover:bg-gray-600',
      icon: GraduationCap,
      color: 'text-gray-500',
    };
  };

  // Get seller name from either sellerName or seller.name
  const getSellerName = () => {
    if (item.seller?.name) return item.seller.name;
    return 'Unknown seller';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Link
        to={`/marketplace/${item._id || 'undefined-item'}`}
        className="block h-full"
      >
        <Card
          className={`h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ${
            isGrid ? '' : 'flex'
          }`}
        >
          {/* Image Section */}
          {item.imagesUrl && item.imagesUrl.length > 0 ? (
            <div
              className={
                isGrid ? 'relative h-48' : 'relative w-1/3 max-w-[180px]'
              }
            >
              <img
                src={item.imagesUrl[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />

              {/* Level Badge */}
              <div className="absolute top-2 left-2">
                <Badge
                  variant={getLevelBadge(item.proficiencyLevel).variant}
                  className={`${
                    getLevelBadge(item.proficiencyLevel).className
                  } flex items-center gap-1`}
                >
                  {(() => {
                    const { icon: Icon } = getLevelBadge(item.proficiencyLevel);
                    return <Icon className="h-3.5 w-3.5" />;
                  })()}
                  {item.proficiencyLevel}
                </Badge>
              </div>

              {/* Views Badge */}
              <div className="absolute bottom-2 right-2">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-black/60 text-white"
                >
                  <Eye className="h-3 w-3" />
                  {item.views || 0}
                </Badge>
              </div>
            </div>
          ) : (
            <div
              className={`bg-gray-100 flex items-center justify-center ${
                isGrid ? 'h-48' : 'w-1/3 max-w-[180px]'
              }`}
            >
              <span className="text-gray-400">No image</span>

              {/* Level Badge */}
              <div className="absolute top-2 left-2">
                <Badge
                  variant={getLevelBadge(item.proficiencyLevel).variant}
                  className={`${
                    getLevelBadge(item.proficiencyLevel).className
                  } flex items-center gap-1`}
                >
                  {(() => {
                    const { icon: Icon } = getLevelBadge(item.proficiencyLevel);
                    return <Icon className="h-3.5 w-3.5" />;
                  })()}
                  {item.proficiencyLevel}
                </Badge>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className={`flex flex-col ${isGrid ? '' : 'flex-1'}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-2">
                <CardTitle
                  className={`${isGrid ? 'text-xl' : 'text-lg'} line-clamp-2`}
                >
                  {item.title}
                </CardTitle>
                <div className="font-bold text-lg flex items-center gap-1 whitespace-nowrap">
                  <img src={cryptoIcon} alt="Credits" className="h-5 w-5" />
                  <span>{Math.round(item.price)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDate(item.updatedAt || item.createdAt)}</span>
              </div>
            </CardHeader>

            <CardContent className="py-2">
              {/* Main category and skill */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="bg-primary/10">
                  {item.category}
                </Badge>
                <Badge variant="secondary">{item.skillName}</Badge>
              </div>

              {/* Description */}
              <CardDescription
                className={`text-sm mb-3 ${
                  isGrid ? 'line-clamp-2' : 'line-clamp-3'
                }`}
              >
                {item.description}
              </CardDescription>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mt-2">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  {item.tags.slice(0, isGrid ? 2 : 4).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs px-2 py-0 h-5"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > (isGrid ? 2 : 4) && (
                    <span className="text-xs text-muted-foreground">
                      +{item.tags.length - (isGrid ? 2 : 4)}
                    </span>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-2 mt-auto border-t">
              <div className="flex items-center gap-1 text-sm">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">By</span>
                <span className="font-medium">{getSellerName()}</span>
              </div>
            </CardFooter>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
