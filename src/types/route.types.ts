import {ComponentType, ReactElement, ReactNode} from 'react';

export type TUserPath = {
  name: string;
  path?: string;
  element?: ComponentType | ReactElement | string;
  icon?: ReactNode;
  children?: TUserPath[];
};

export type TRouteItem = {
  path: string;
  element: ReactElement;
};