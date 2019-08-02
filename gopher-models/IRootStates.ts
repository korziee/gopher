/** Directory listing for the root */
type root_listing = "root_listing";
/** The root of a child should be listed */
type child_listing = "child_listing";
/** The child should handle the listing, and decide whether or not it should list something */
type child_handle = "child_handle";
/** Message did not contain a slash, error */
type no_slash_found = "no_slash_found";
/** Child listing not found, error */
type not_found = "not_found";
/** Message was too long, error */
type message_too_long = "message_too_long";

/** All of the states that can be formed from a message input on the root server */
export type IRootStates =
  | root_listing
  | child_listing
  | child_handle
  | no_slash_found
  | not_found
  | message_too_long;
