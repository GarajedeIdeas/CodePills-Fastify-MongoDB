export interface GoogleRoute {
  routes: [
    {
      legs: {
        distance: {
          text: string;
          value: number;
        };
        duration: {
          text: string;
          value: number;
        };
      }[];
    }
  ];
}
