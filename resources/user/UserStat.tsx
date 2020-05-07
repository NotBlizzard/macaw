import React from "react";
import { Box, Typography, makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const useStyles = makeStyles(() => ({
  userStat: {
    margin: "4px",
  },
}));

interface User {
  id: string;
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
  color: string;
}
const UserStat = ({ user, color }: UserStatProps): JSX.Element => {
  const classes = useStyles();

  return (
    <Box
      display="flex"
      flexDirection="row"
      className={`user-stats-border-bottom-${color}`}
    >
      <Box display="block" textAlign="center" className={classes.userStat}>
        <Typography variant="h5">Messages</Typography>
        <Typography variant="h3" className={`colored-tooltip-${color}`}>
          {user.messageCount}
        </Typography>
      </Box>
      <Box display="block" textAlign="center" className={classes.userStat}>
        <Typography variant="h5">Followers</Typography>
        <Link to={`/@${user.username}/followers`} className="links">
          <Typography variant="h3" className={`colored-tooltip-${color}`}>
            {user.followers.length}
          </Typography>
        </Link>
      </Box>
      <Box display="block" textAlign="center" className={classes.userStat}>
        <Typography variant="h5">Following</Typography>
        <Link to={`/@${user.username}/following`} className="links">
          <Typography variant="h3" className={`colored-tooltip-${color}`}>
            {user.following.length}
          </Typography>
        </Link>
      </Box>
    </Box>
  );
};

UserStat.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    messageCount: PropTypes.number,
    isDifferentUser: PropTypes.bool,
    isFollowingUser: PropTypes.bool,
    username: PropTypes.string,
    displayname: PropTypes.string,
    messages: PropTypes.array,
    followers: PropTypes.array,
    following: PropTypes.array,
    user: PropTypes.any,
    color: PropTypes.string,
  }),
  color: PropTypes.string,
};

export default UserStat;
