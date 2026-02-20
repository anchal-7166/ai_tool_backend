export const FILTER_ENTITIES = {
  USERS: "users",
  TOOLS:"tools",
  ALL: () => [
    FILTER_ENTITIES.TOOLS,
    FILTER_ENTITIES.USERS,
  ],
};
