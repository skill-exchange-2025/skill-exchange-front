import {TRouteItem, TUserPath} from "@/types";

export const routeGenerator = (
    items: TUserPath[],
    userPermissions: string[]
): TRouteItem[] => {
  return items.reduce((acc: TRouteItem[], item) => {
    // Check parent permissions
    const hasParentAccess = item.permissions
        ? item.permissions.some(p => userPermissions.includes(p))
        : true;

    if (hasParentAccess) {
      // Add parent route if it has path/element
      if (item.path && item.element) {
        acc.push(<TRouteItem>{path: item.path, element: item.element});
      }

      // Process children
      if (item.children) {
        item.children.forEach(child => {
          // Check child permissions
          const hasChildAccess = child.permissions
              ? child.permissions.some(p => userPermissions.includes(p))
              : true;

          if (hasChildAccess && child.path && child.element) {
            acc.push(<TRouteItem>{
              path: child.path,
              element: child.element,
            });
          }
        });
      }
    }

    return acc;
  }, []);
};
