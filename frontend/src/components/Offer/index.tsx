import React, { useEffect } from "react";
import {
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Snackbar,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useStyles } from "./Offer.style";
import { CheckCircle } from "@material-ui/icons";
import { GridElement } from "../../util/GridElement";
import { UserSummary } from "../../util/UserSummary";
import { TrackingDialog } from "./TrackingDialog";
import { CargoCoins } from "../../util/CargoCoins";
import Divider from "@material-ui/core/Divider";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import StarIcon from "@material-ui/icons/Star";
import { UserDetails } from "../../model/UserDetails";
import { OfferDetails } from "../../model/OfferDetails";
import { RatingDialog } from "./RatingDialog";
import { setChatOpenById } from "../../features/chat/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import { acceptOffer, fetchOffers } from "../../features/offers/offersSlice";
import {
  acceptRequest,
  fetchRequests,
} from "../../features/requests/requestsSlice";
import { ConfirmDialog } from "../../util/ConfirmDialog";
import clsx from "clsx";
import { RootState } from "../../features/rootReducer";
import { setBookOfferPaymentStatus } from "../../features/booking/bookingSlice";

export interface OfferProps {
  provider?: UserDetails;
  customer?: UserDetails;
  offer: OfferDetails;
  loggedInUsername: string;
}

export const renderService = (service: string) => {
  switch (service) {
    case "transport":
      return "Transport";
    case "rideShare":
      return "Mitfahrgelegenheit";
    default:
      return "";
  }
};

const typography = (text: string) => {
  return <Typography>{text}</Typography>;
};

export const Offer: React.FC<OfferProps> = ({
  offer,
  provider,
  customer,
  loggedInUsername,
}) => {
  const classes = useStyles();
  const [ratingOpen, setRatingOpen] = React.useState(false);
  const [trackingOpen, setTrackingOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const booking = useSelector((state: RootState) => state.booking);

  const isPendingOffer = customer === undefined;
  const isPendingRequest = provider === undefined;
  const isPending = isPendingOffer || isPendingRequest;

  const isProvider = loggedInUsername === provider?.username;
  const isCustomer = loggedInUsername === customer?.username;
  const isMyOffer = isProvider || isCustomer;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setBookOfferPaymentStatus({
        offerId: offer.id,
        paymentState: "paymentInProgress",
      })
    );
  }, [dispatch, offer.id]);

  const handleTrackingClick = (event: any) => {
    event.stopPropagation();
    setTrackingOpen(true);

    if (isProvider) dispatch(fetchOffers());
    if (isCustomer) dispatch(fetchRequests());
  };

  const handleAvatarClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleOpenConfirm = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setConfirmOpen(true);
  };

  const handleBookOffer = () => {
    if (isPendingOffer) {
      dispatch(acceptOffer(offer.id));
    } else {
      dispatch(acceptRequest(offer.id));
    }
  };

  const handleAvatarMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenChat = () => {
    dispatch(setChatOpenById(undefined));
    dispatch(setChatOpenById(offer.id));
    handleAvatarMenuClose();
  };

  const handleOpenRating = () => {
    setRatingOpen(true);
    handleAvatarMenuClose();
  };

  const handleSnackbarClose = () => {
    dispatch(
      setBookOfferPaymentStatus({
        offerId: offer.id,
        paymentState: "paymentInProgress",
      })
    );
  };

  const getConfirmText = () => {
    if (isPendingOffer) {
      return `Bei Annahme dieses Angebots werden ${offer.price} CargoCoins von Ihrem MyCargonaut-Konto abgebucht. Fortfahren?`;
    } else {
      return `Bei Annahme dieser Anfrage werden ${offer.price} CargoCoins auf Ihr MyCargonaut-Konto überwiesen. Fortfahren?`;
    }
  };

  return (
    <Accordion
      className={classes.root}
      data-testid="offer-card"
      classes={{ rounded: classes.paper }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container alignItems="center">
          {!isMyOffer && (
            <GridElement>
              {isPendingOffer ? (
                <UserSummary
                  username={provider?.username}
                  rating={provider?.rating}
                  userId={provider?.id}
                />
              ) : (
                <UserSummary
                  username={customer?.username}
                  rating={customer?.rating}
                  userId={customer?.id}
                />
              )}
            </GridElement>
          )}
          <GridElement header="von:">{typography(offer.from)}</GridElement>
          <GridElement header="nach:">{typography(offer.to)}</GridElement>
          <GridElement header="Service:">
            {typography(renderService(offer.service))}
          </GridElement>
          <GridElement header="Datum:">
            {typography(offer.orderDate.toLocaleDateString())}
          </GridElement>
          {offer.service === "rideShare" ? (
            <GridElement header="Sitze:">
              {typography(String(offer.seats))}
            </GridElement>
          ) : (
            <GridElement header="Stauraum:">
              {typography(String(offer.storageSpace) + " l")}
            </GridElement>
          )}
          <GridElement header="Preis:">
            {
              <div style={{ display: "flex", justifyContent: "center" }}>
                {typography(String(offer.price))}
                <CargoCoins className={classes.moneyIcon} />
              </div>
            }
          </GridElement>
          {!isMyOffer && isPending ? (
            <GridElement>
              <Box mt={2}>
                <IconButton color="primary" onClick={handleOpenConfirm}>
                  <CheckCircle
                    data-testid="check-circle-icon"
                    fontSize="large"
                  />
                </IconButton>
                <ConfirmDialog
                  open={confirmOpen}
                  text={getConfirmText()}
                  onClose={() => setConfirmOpen(false)}
                  action={handleBookOffer}
                />
              </Box>
            </GridElement>
          ) : (
            <GridElement header="Status:">
              {isPending ? (
                <Typography className={classes.greenText}>
                  <i>OFFEN</i>
                </Typography>
              ) : (
                <div>
                  <Button
                    color="secondary"
                    variant="outlined"
                    onClick={handleTrackingClick}
                    className={clsx({
                      [classes.trackingCompleted]:
                        offer.tracking?.state === "Delivered",
                    })}
                  >
                    {offer.tracking?.state === "Delivered"
                      ? "ABGESCHLOSSEN"
                      : "IN BEARBEITUNG"}
                  </Button>
                  {offer.tracking && (
                    <TrackingDialog
                      offerId={offer.id}
                      role={isCustomer ? "customer" : "provider"}
                      tracking={offer.tracking}
                      open={trackingOpen}
                      onClose={() => setTrackingOpen(false)}
                    />
                  )}
                </div>
              )}
            </GridElement>
          )}
          {isMyOffer && (
            <GridElement>
              {!isPending && (
                <div onClick={handleAvatarClick}>
                  {isProvider ? (
                    <UserSummary
                      username={customer?.username}
                      rating={customer?.rating}
                      userId={customer?.id}
                    />
                  ) : (
                    <UserSummary
                      username={provider?.username}
                      rating={provider?.rating}
                      userId={provider?.id}
                    />
                  )}
                </div>
              )}
            </GridElement>
          )}
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          open={booking[offer.id] === "paymentFailure"}
          onClose={handleSnackbarClose}
          message="Angebot konnte nicht angenommen werden. Haben Sie genug
        CargoCoins auf Ihrem Konto?"
          key={1}
          autoHideDuration={3000}
        />
      </AccordionSummary>
      <Divider variant="middle" className={classes.divider} />
      <AccordionDetails className={classes.accordionDetails}>
        <Box ml={7} my={2}>
          <Typography variant="subtitle2">Beschreibung:</Typography>
          {booking[offer.id] === "paymentFailure" ? "FAIL" : ""}
          <Typography>
            {offer.description ? offer.description.trim() : "-"}
          </Typography>
        </Box>
      </AccordionDetails>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleAvatarMenuClose}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <MenuItem onClick={handleOpenChat}>
          <ListItemIcon>
            <ChatBubbleIcon />
          </ListItemIcon>
          Chat
        </MenuItem>
        {isCustomer && (
          <MenuItem onClick={handleOpenRating}>
            <ListItemIcon>
              <StarIcon />
            </ListItemIcon>
            Bewerten
          </MenuItem>
        )}
      </Menu>
      <RatingDialog
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        offerId={offer.id}
        username={
          (loggedInUsername === customer?.username
            ? provider?.username
            : customer?.username) ?? ""
        }
      />
    </Accordion>
  );
};
