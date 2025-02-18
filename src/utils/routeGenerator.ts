import {TRouteItem, TUserPath} from "@/types";

export const routeGenerator = (items: TUserPath[]) => {
  return items.reduce((acc: TRouteItem[], item) => {
    if (item.path && item.element) {
      acc.push(<TRouteItem>{
        path: item.path,
        element: item.element,
      });
    }

    if (item.children) {
      item.children.forEach((child) => {
        acc.push(<TRouteItem>{
          path: child.path as string,
          element: child.element,
        });
      });
    }
    return acc;
  }, []);
};
