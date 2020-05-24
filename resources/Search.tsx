import React, { useState, useEffect, useContext } from "react";
import UserInfoCard from "./user/UserInfoCard";
import {
  Grid,
  makeStyles,
  CircularProgress,
  Container,
  Box,
  Theme,
  Card,
  CardContent,
  Typography,
  CardMedia,
  IconButton,
  Tooltip,
  TextField,
  fade,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import {
  Repeat as RepeatIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons";
import InfiniteScroll from "react-infinite-scroller";
import Cookies from "js-cookie";
import Gravatar from "./util/Gravatar";
import Moment from "./util/Moment";
import UserTooltip from "./user/UserTooltip";
import { Link } from "react-router-dom";
import ViewMessage from "./message/ViewMessage";
import DeleteMessage from "./message/DeleteMessage";
import ViewImage from "./message/ViewImage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";
import DarkModeContext from "./DarkMode";

interface StyleProps {
  darkMode: boolean;
}

interface SearchProps {
  socketio: SocketIOClient.Socket;
}

interface User {
  id: number;
  color: string;
  createdAt: string;
  username: string;
  displayname: string;
  email: string;
  description: string;
  location: string;
  link: string;
  pinned: Message;
  followers: [];
  following: [];
  isDifferentUser?: boolean;
  messages: [];
}
interface Message {
  id: number;
  createdAt: string;
  data: string;
  user: User;
  liked: boolean;
  file: string;
  likes: Like[];
  reposted: boolean;
  reposts: Repost[];
  messageCreatedAt?: string;
}
interface Repost {
  id: number;
  createdAt: string;
  user: User;
  message: Message;
}
interface Like {
  id: number;
  user: User;
  message: Message;
}

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    color: "#eee",
    borderColor: "#eee !important",
    "& .MuiFormLabel-root": {
      color: "#79838a",
    },
    "& .MuiOutlinedInput-root": {
      marginBottom: "4rem",
      color: "#eee",
      borderColor: "#eee !important",
      backgroundColor: fade("#66d0f9", 0.1),
      "&.Mui-focused fieldset": {
        borderColor: "#09a6f4",
        color: "#eee",
      },
    },
    "&:focus": {
      borderColor: "#eee",
    },
  },
  mediaToggles: {
    padding: "1rem",
    cursor: "pointer",
  },
  card: {
    backgroundColor: "#193344",
  },
  username: (props: StyleProps) => ({
    color: props.darkMode ? "#b8c5d9bd" : "#070b0fbd",
    fontSize: "1rem",
  }),
  displayname: (props: StyleProps) => ({
    color: props.darkMode ? "#eee" : "#222",
    fontSize: "1rem",
  }),
  message: {
    backgroundColor: "#192a3d",
    border: 0,
    color: "#eee",
    marginTop: "1rem",
  },
  image: {
    height: "400px",
  },
  delete: {
    color: "#8aadbd",
    "&:hover": {
      color: "#e64848",
    },
  },
  like: {
    color: "#8aadbd",
    "&:hover": {
      color: "#fffc59",
    },
  },
  liked: {
    color: "#fffc59",
  },
  repost: {
    color: "#8aadbd",
    "&:hover": {
      color: "#81db6b",
    },
  },
  reposted: {
    color: "#81db6b",
  },
}));

const Search = ({ socketio }: SearchProps): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });
  // const { current: socket } = useRef(socketio);
  const color: string = Cookies.get("color") || "default";
  const urlParams: URLSearchParams = new URLSearchParams(
    document.location.search.substring(1),
  );
  const theme = useTheme();
  // true = desktop, false = mobile
  const breakpoint = useMediaQuery(theme.breakpoints.up("sm"));
  const [openImage, setOpenImage] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [messageId, setMessageId] = useState(0);
  const [imageName, setImageName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [messages, setMessages] = useState<Message[]>([] as Message[]);
  const [users, setUsers] = useState<User[]>([] as User[]);
  const [page, setPage] = useState(1);
  const [user, setUser] = useState<User>({} as User);
  const [dialog, setDialog] = useState<Message>({} as Message);
  useEffect(() => {
    fetch(`/api/message/search${location.search}&page=${page}`, {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessages(data.messages);
          setUsers(data.users);
          setPage(page + 1);
        }
      });
  }, []);

  const loadMoreMessages = (): void => {
    fetch(`/api/message/search${location.search}&page=${page}`, {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPage(page + 1);
          setUser(data.user);
          setMessages(messages.concat(data.messages));
        } else {
          setHasMore(false);
        }
        setIsLoading(false);
      });
  };

  const handleLike = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId = Number(e.currentTarget.getAttribute("data-id"));
    //e.preventDefault();
    fetch("/api/message/like", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ id: messageId }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const messagesUpdated = messages.map((m) => {
            if (m.id === messageId) {
              if (data.liked) {
                m.liked = true;
                m.likes.push(data.like);
              } else {
                m.liked = false;
                m.likes = m.likes.filter((like) => like.id !== data.likeId);
              }
            }
            return m;
          });
          setMessages(messagesUpdated);
        }
      });
  };

  const handlePin = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): Promise<void> => {
    const messageId = Number(e.currentTarget.getAttribute("data-id"));
    await fetch("/api/message/pin", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      body: JSON.stringify({ id: messageId }),
    });
  };

  const handleDelete = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId = Number(e.currentTarget.getAttribute("data-id"));
    setMessageId(messageId);
    setOpenDelete(true);
  };

  const handleRepost = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    const messageId = Number(e.currentTarget.getAttribute("data-id"));
    fetch("/api/message, repost", {
      method: "POST",
      body: JSON.stringify({ id: messageId }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const messagesUpdated = messages.map((m) => {
            if (m.id === messageId) {
              if (data.reposted) {
                m.reposted = true;
                m.reposts.push(data.repost);
              } else {
                m.reposted = false;
                m.reposts = m.reposts.filter(
                  (repost) => repost.id !== data.repostId,
                );
              }
            }
            return m;
          });
          setMessages(messagesUpdated);
        }
      });
  };

  const handleDialogOpen = (
    e: React.MouseEvent<HTMLDivElement | HTMLElement>,
  ): void | boolean => {
    const tagNames: string[] = ["a", "button", "i", "path", "svg", "span"];
    const imageClassName = "MuiCardMedia-root";
    // prevent dialog on clicking like/repost/etc
    if (tagNames.includes((e.target as any).tagName.toLowerCase())) {
      return false;
    }
    // prevent dialog on clicking image
    if ((e.target as any).classList.contains(imageClassName)) return false;
    const messageId = Number(e.currentTarget.getAttribute("data-id"));
    fetch(`/api/message/dialog?id=${messageId}`, {
      headers: { "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")! },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDialog(data.message);
          setOpenView(true);
        }
      });
  };

  const handleImage = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void => {
    e.preventDefault();
    setImageName(e.currentTarget.getAttribute("data-image-name")!);
    setOpenImage(true);
  };

  const handleDialogClose = (): void => {
    setOpenView(false);
  };

  const handleImageClose = (): void => {
    setOpenImage(false);
  };

  const handleDeleteClose = (): void => {
    setOpenDelete(false);
  };

  return (
    <InfiniteScroll
      pageStart={1}
      loadMore={loadMoreMessages}
      hasMore={!isLoading && hasMore}
      loader={
        <Container>
          <CircularProgress />
        </Container>
      }
    >
      <form method="GET" action="/search">
        <TextField
          name="qs"
          id="outlined-basic"
          label="Search"
          fullWidth
          variant="outlined"
          classes={{
            root: classes.input,
          }}
        />
      </form>
      <Typography variant="h4" style={{ paddingBottom: "4rem" }}>
        Search Results for {`"${urlParams.get("qs")}"`}{" "}
      </Typography>
      <div className="messages">
        <ViewMessage
          color={color}
          message={dialog}
          open={openView}
          user={user}
          handleClose={handleDialogClose}
        />
        <DeleteMessage
          socketio={socketio}
          open={openDelete}
          handleClose={handleDeleteClose}
          messageId={messageId}
        />
        <ViewImage
          open={openImage}
          handleClose={handleImageClose}
          imageName={imageName}
        />
        {users ? (
          <Grid container spacing={8}>
            {users.map((user) => (
              <Grid item xs={3} key={user.id}>
                <UserInfoCard user={user} />
              </Grid>
            ))}
          </Grid>
        ) : null}
        {messages.map((message) => (
          <Card
            className={classes.message}
            key={message.id}
            raised={true}
            onClick={handleDialogOpen}
            data-id={message.id}
          >
            <CardContent>
              <Grid container spacing={1}>
                <Grid item xs={breakpoint ? 1 : 2}>
                  <Gravatar
                    size={breakpoint ? 8 : 6}
                    email={message.user.email}
                  />
                </Grid>
                <Grid item xs={breakpoint ? 11 : 10}>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Link
                        to={"/@" + message.user.username}
                        className={`username-link-${color}`}
                      >
                        <Typography className={classes.displayname}>
                          {message.user.displayname === undefined ? (
                            <Typography>{message.user.username}</Typography>
                          ) : (
                            <Typography>{message.user.displayname}</Typography>
                          )}
                        </Typography>{" "}
                        <Typography className={classes.username}>
                          @{message.user.username}
                        </Typography>
                      </Link>{" "}
                      <Moment
                        time={
                          message.reposted
                            ? message.messageCreatedAt!
                            : message.createdAt
                        }
                        profile={false}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography display="inline">
                        {message.data.split(" ").map((word: string) => {
                          if (word.startsWith("@")) {
                            return <UserTooltip username={word.slice(1)} />;
                          } else if (word.startsWith("#")) {
                            return (
                              <Link to={`/search?qs=%23${word.slice(1)}`}>
                                <Typography
                                  variant="body1"
                                  display="inline"
                                  className={`link-${color}`}
                                >
                                  {word}
                                </Typography>
                              </Link>
                            );
                          } else {
                            return ` ${word} `;
                          }
                        })}
                      </Typography>
                      {message.file ? (
                        <CardMedia
                          onClick={handleImage}
                          image={`/uploads/${message.file}`}
                          title="test"
                          data-image-name={message.file}
                          className={classes.image}
                        />
                      ) : null}
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="space-between">
                        <div>
                          <Tooltip title={"Like"} arrow>
                            <IconButton
                              onClick={handleLike}
                              edge="start"
                              data-id={message.id}
                              className={
                                message.liked ? classes.liked : classes.like
                              }
                            >
                              {message.liked ? (
                                <StarIcon />
                              ) : (
                                <StarBorderIcon />
                              )}{" "}
                            </IconButton>
                          </Tooltip>

                          {message.likes.length}
                          <Tooltip title={"Repost"} arrow>
                            <IconButton
                              onClick={handleRepost}
                              data-id={message.id}
                              className={
                                message.reposted
                                  ? classes.reposted
                                  : classes.repost
                              }
                            >
                              {message.reposted ? (
                                <RepeatIcon className={"reposted"} />
                              ) : (
                                <RepeatIcon />
                              )}{" "}
                            </IconButton>
                          </Tooltip>
                          {message.reposts.length}
                        </div>
                        <div>
                          {user.isDifferentUser ? null : (
                            <Tooltip title={"Pin"} arrow>
                              <IconButton
                                onClick={handlePin}
                                data-id={message.id}
                                className={`pin-${color}`}
                              >
                                <FontAwesomeIcon icon={faThumbtack} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title={"Delete"} arrow>
                            <IconButton
                              onClick={handleDelete}
                              data-id={message.id}
                              className={classes.delete}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default Search;
