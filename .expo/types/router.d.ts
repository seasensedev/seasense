/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `` | `/` | `/(auth)` | `/(logs)` | `/(settings)` | `/(tabs)` | `/_sitemap` | `/catch-details` | `/change-password` | `/credentials` | `/edit-catches` | `/edit-location` | `/edit-profile` | `/email-login` | `/email-signup` | `/home` | `/log-in` | `/navigate-location` | `/profile` | `/reset-password` | `/sonar` | `/splash-screen` | `/sst-map` | `/user-settings`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
