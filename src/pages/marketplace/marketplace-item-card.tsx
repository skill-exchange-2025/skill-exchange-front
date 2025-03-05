import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketplaceItem } from '@/types/marketplace';
import { formatDistanceToNow, isValid } from 'date-fns';
import cryptoIcon from '@/assets/icons/crypto.png';
import { Eye } from 'lucide-react';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  viewMode: 'grid' | 'list';
}

export function MarketplaceItemCard({
  item,
  viewMode,
}: MarketplaceItemCardProps) {
  // Debug log to see the item structure
  console.log('MarketplaceItemCard item:', item);

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

  // Function to get level badge color
  const getLevelBadgeColor = (level: string) => {
    const normalizedLevel = level.toLowerCase();
    if (normalizedLevel.includes('advanced')) return 'bg-red-500 text-white';
    if (normalizedLevel.includes('intermediate'))
      return 'bg-orange-500 text-white';
    if (normalizedLevel.includes('beginner')) return 'bg-green-500 text-white';
    return 'bg-gray-500 text-white'; // Default color
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
      whileHover={{ y: -5 }}
    >
      <Link
        to={`/marketplace/${item._id || 'undefined-item'}`}
        className="block h-full"
      >
        <Card
          className={`cursor-pointer h-full flex ${
            isGrid ? 'flex-col' : 'flex-row'
          } relative`}
        >
          {/* Level Badge */}
          <div className="absolute top-2 right-2 z-10">
            <Badge className={`${getLevelBadgeColor(item.proficiencyLevel)}`}>
              {item.proficiencyLevel}
            </Badge>
          </div>

          {/* Views Badge */}
          <div className="absolute bottom-2 right-2 z-10">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {item.views || 0}
            </Badge>
          </div>

          {item.imagesUrl && item.imagesUrl.length > 0 && (
            <div
              className={
                isGrid ? 'h-48 overflow-hidden' : 'w-24 h-24 overflow-hidden'
              }
            >
              <img
                src={item.imagesUrl[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className={`flex flex-col ${isGrid ? '' : 'flex-1'}`}>
            <CardHeader className={isGrid ? '' : 'py-2 px-4'}>
              <div className="flex justify-between items-start">
                <CardTitle className={isGrid ? 'text-xl' : 'text-base'}>
                  {item.title}
                </CardTitle>
                {!isGrid && (
                  <div className="font-bold flex items-center gap-1">
                    <img src={cryptoIcon} alt="Credits" className="h-4 w-4" />
                    {Math.round(item.price)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{item.skillName}</Badge>
                <Badge variant="secondary">{item.category}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.updatedAt || item.createdAt)}
                </span>
              </div>
            </CardHeader>
            <CardContent className={`flex-grow ${isGrid ? '' : 'py-2 px-4'}`}>
              <p className={isGrid ? 'line-clamp-2' : 'line-clamp-1'}>
                {item.description}
              </p>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter
              className={`flex justify-between ${isGrid ? '' : 'py-2 px-4'}`}
            >
              {isGrid && (
                <div className="font-bold flex items-center gap-1">
                  <img src={cryptoIcon} alt="Credits" className="h-4 w-4" />
                  {Math.round(item.price)}
                </div>
              )}
              <div className="text-sm text-muted-foreground flex flex-col items-end">
                <span>By</span>
                <span className="font-medium">{getSellerName()}</span>
              </div>
            </CardFooter>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
