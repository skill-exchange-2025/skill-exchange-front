import {NavLink} from "react-router-dom";
import {TSidebarItem, TUserPath} from "@/types";

export const sidebarItemsGenerator = (items: TUserPath[], role: string) => {
  return items.reduce((acc: TSidebarItem[], item) => {
    if (item.path && item.name) {
      acc.push({
        key: item.name,
        label: <NavLink to={`/${role}/${item.path}`}>{item.name}</NavLink>,
        icon: item.icon,
      });
    }

    if (item.children) {
      acc.push({
        key: item.name,
        label: item.name,
        icon: item.icon,
        children: item.children.map((child) => {
          if (child?.name) {
            return {
              key: child.name,
              label: (
                  <NavLink to={`/${role}/${child.path}`}>{child.name}</NavLink>
              ),
              icon: child.icon,
            };
          }
        }),
      });
    }

    return acc;
  }, []);
};
