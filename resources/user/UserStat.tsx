import React from "react";
import { Box, Typography, makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

interface User {
  id: number;
  color: string;
  createdAt: string;
  username: string;
  displayname: string;
  email: string;
  description: string;
  location: string;
  //pinned: Message;
  followers: [];
  following: [];
  messageCount: number;
  isDifferentUser?: boolean;
}

interface UserStatProps {
  user: User;
}

const useStyles = makeStyles(() => ({
  userStat: {
    margin: "4px",
  },
}));

const UserStat = ({ user }: UserStatProps): JSX.Element => {
  const classes = useStyles();
  const color = Cookies.get("color") || "default";

  return (
    <Box
      display="flex"
      flexDirection="row"
      className={`border-bottom-${color}`}
    >
      <Box display="block" textAlign="center" className={classes.userStat}>
        <Typography variant="h5">Messages</Typography>
        <Typography variant="h3" className={`color-${color}`}>
          {user.messageCount}
        </Typography>
      </Box>
      <Box display="block" textAlign="center" className={classes.userStat}>
        <Typography variant="h5">Followers</Typography>
        <Link
          to={`/@${user.username}/followers`}
          className={`no-text-decoration-link-${color}`}
        >
          <Typography variant="h3">{user.followers.length}</Typography>
        </Link>
      </Box>
      <Box display="block" textAlign="center" className={classes.userStat}>
        <Typography variant="h5">Following</Typography>
        <Link
          to={`/@${user.username}/following`}
          className={`no-text-decoration-link-${color}`}
        >
          <Typography variant="h3">{user.following.length}</Typography>
        </Link>
      </Box>
    </Box>
  );
};

export default UserStat;
