import { Service } from "../../../backend/src/offer/offer";
import { TrackingDetails } from "./TrackingDetails";

export interface OfferDetails {
  id: string;
  from: string;
  to: string;
  service: Service;
  orderDate: Date;
  seats?: number;
  storageSpace?: number;
  price: number;
  description: string;
  tracking?: TrackingDetails;
}
