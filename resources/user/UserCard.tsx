import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  makeStyles,
  Card,
  CardContent,
} from "@material-ui/core";
import Gravatar from "../util/Gravatar";
import React from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

interface UserCardProps {
  user: {
    id: number;
    email: string;
    displayname: string;
    username: string;
    description: string;
    createdAt: string;
    location: string;
    link: string;
    followers: [];
    following: [];
    messages: [];
    isDifferentUser?: boolean;
    isFollowingUser?: boolean;
  };
}

const useStyles = makeStyles(() => ({
  tooltip: {
    padding: "1rem",
    backgroundColor: "#193344",
    maxWidth: "20rem",
  },
  greyText: {
    color: "#b8c5d9bd",
  },
  username: {
    color: "#eee !important",
  },
  card: {
    color: "#eee",
    boxShadow: "none",
    backgroundColor: "#193344",
  },
}));

const UserCard = ({ user }: UserCardProps): JSX.Element => {
  const color = Cookies.get("color") || "default";

  const classes = useStyles();
  const [isFollowingUser, setIsFollowingUser] = useState(user.isFollowingUser);
  const handleFollow = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ): Promise<void> => {
    const userId = e.currentTarget.getAttribute("data-id");
    await fetch("/api/message/follow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify({ id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setIsFollowingUser(data.following);
      });
  };
  return (
    <Card classes={{ root: classes.card }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Gravatar email={user.email} size={8} />
          {user.isDifferentUser ? (
            <Button
              variant={isFollowingUser ? "contained" : "outlined"}
              data-id={user.id}
              href={""}
              className={`button-${isFollowingUser ? "" : "outline-"}${color}`}
              onClick={handleFollow}
            >
              {isFollowingUser ? "Following" : "Follow"}
            </Button>
          ) : null}
        </Box>
        <Typography variant="h6" className={classes.username}>
          <Link to={"/@" + user.username} className={classes.username}>
            {user.displayname}
          </Link>
        </Typography>
        <Typography variant="subtitle1" className={classes.greyText}>
          @{user.username}
        </Typography>
        <Typography variant="body1" style={{ marginBottom: "1rem" }}>
          {user.description}
        </Typography>
        <Grid container style={{ textAlign: "center" }}>
          <Grid item xs={4}>
            <Typography variant="body2" className={classes.greyText}>
              Messages
            </Typography>
            <Typography
              variant="h2"
              className={`no-text-decoration-link-${color}`}
            >
              {user.messages.length}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" className={classes.greyText}>
              Following
            </Typography>
            <Typography
              variant="h2"
              className={`no-text-decoration-link-${color}`}
            >
              {user.following.length}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" className={classes.greyText}>
              Followers
            </Typography>
            <Typography
              variant="h2"
              className={`no-text-decoration-link-${color}`}
            >
              {user.followers.length}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserCard;
