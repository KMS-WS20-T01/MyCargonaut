import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { Offer, Service } from "./offer";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OfferService } from "./offer.service";
import { UsersService } from "../users/users.service";
import { RatingService } from "../rating/rating.service";
import { StatusService } from "../status/status.service";

@Controller("offer")
@UseGuards(JwtAuthGuard)
export class OfferController {
  constructor(
    private readonly offerService: OfferService,
    private readonly userService: UsersService,
    private readonly ratingService: RatingService,
    private readonly statusService: StatusService
  ) {}

  @Delete(":offerId")
  async deleteOffer(@Param("offerId") offerId: string, @Request() req) {
    return this.offerService.deleteOffer(offerId?.trim());
  }

  @Put(":offerId")
  async editOffer(
    @Param("offerId") offerId: string,
    @Body("from") from: string | null,
    @Body("to") to: string | null,
    @Body("service") service: Service | null,
    @Body("price") price: number | null,
    @Body("storageSpace") storageSpace: number | null,
    @Body("seats") seats: number | null,
    @Body("description") description: string | null,
    @Request() req
  ) {
    const oldOffer = await this.offerService.getOfferById(offerId?.trim());
    const newOffer: Offer = {
      from: from?.trim(),
      to: to?.trim(),
      createDate: oldOffer.createDate,
      orderDate: undefined,
      service: service,
      price: price,
      seats: seats,
      storageSpace: storageSpace,
      description: description?.trim(),
      provider: oldOffer.provider,
      customer: oldOffer.customer,
    };
    return this.offerService.updateOffer(offerId, newOffer);
  }

  @Post("addOffer")
  async addOffer(
    @Body("isOffer") isOffer: boolean,
    @Body("from") from: string | null,
    @Body("to") to: string | null,
    @Body("orderDate") orderDate: Date | null,
    @Body("service") service: Service | null,
    @Body("price") price: number | null,
    @Body("storageSpace") storageSpace: number | null,
    @Body("seats") seats: number | null,
    @Body("description") description: string | null,
    @Request() req
  ) {
    const newOffer: Offer = {
      from: from?.trim(),
      to: to?.trim(),
      createDate: new Date(),
      orderDate: orderDate,
      service: service,
      price: price,
      seats: seats,
      storageSpace: storageSpace,
      description: description?.trim(),
      provider: undefined,
      customer: undefined,
    };
    if (isOffer) {
      newOffer.provider = req.user.id;
    } else {
      const user = await this.userService.findOneById(req.user.id);
      if (user.cargoCoins >= price) {
        await this.userService.updateMoney(req.user.id, 0 - price);
      } else {
        throw new HttpException(
          "Not enaught Cargo Coins",
          HttpStatus.BAD_REQUEST
        );
      }
      newOffer.customer = req.user.id;
    }
    return this.offerService.addOffer(newOffer);
  }

  @Post("bookOffer/:offerId")
  async bookOffer(@Param("offerId") offerId: string, @Request() req) {
    const offer = await this.offerService.getOfferById(offerId);
    if (offer.provider == undefined) {
      offer.provider = req.user.id;
    } else {
      offer.customer = req.user.id;
    }
    const customerUser = await this.userService.findOneById(offer.customer);
    if (
      customerUser.cargoCoins >= offer.price ||
      offer.customer != req.user.id
    ) {
      if (offer.customer == req.user.id) {
        await this.userService.updateMoney(offer.customer, 0 - offer.price);
      }
      await this.userService.updateMoney(offer.provider, offer.price);
    } else {
      throw new HttpException(
        "Not enaught Cargo Coins",
        HttpStatus.BAD_REQUEST
      );
    }
    await this.statusService.addStatus({
      offer: offerId?.trim(),
      createDate: new Date(),
      state: "Waiting",
    });
    return this.offerService.updateOffer(offerId, offer);
  }

  @Get()
  async getOffers(@Query() query, @Request() req) {
    let offerList;
    if (query?.forOffer == "true") {
      if (query?.forPrivate == "true") {
        offerList = await this.offerService.findAllOffersByUser(req.user.id);
      } else {
        offerList = await this.offerService.getAllOffers();
      }
    } else {
      if (query?.forPrivate == "true") {
        offerList = await this.offerService.findAllRequestsByUser(req.user.id);
      } else {
        offerList = await this.offerService.getAllRequests();
      }
    }

    for (let i = 0; i < offerList.length; i++) {
      offerList[i] = offerList[i]._doc;

      if (offerList[i].provider != undefined) {
        offerList[i] = await addStars(
          offerList[i],
          this.offerService,
          this.ratingService,
          offerList[i].provider,
          "providerRating"
        );
        const user = await this.userService.findOneById(offerList[i].provider);
        offerList[i] = { ...offerList[i], providerUsername: user.username };
      }

      if (offerList[i].customer != undefined) {
        offerList[i] = await addStars(
          offerList[i],
          this.offerService,
          this.ratingService,
          offerList[i].customer,
          "customerRating"
        );
        const user = await this.userService.findOneById(offerList[i].customer);
        offerList[i] = { ...offerList[i], customerUsername: user.username };
      }
      if (
        offerList[i].provider != undefined &&
        offerList[i].customer != undefined
      ) {
        offerList[i] = {
          ...offerList[i],
          tracking: await this.statusService.findByOffer(offerList[i]._id),
        };
      }
    }
    return offerList;
  }
}

const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

export const addStars = async (
  offer,
  offerService,
  ratingService,
  user,
  tag
) => {
  const personalOffers = await offerService.findAllOffersByUser(user);
  const starList = [];
  for (let j = 0; j < personalOffers.length; j++) {
    const rating = await ratingService.findByOffer(personalOffers[j]._id);
    if (rating != undefined) {
      starList.push(rating.rating);
    }
  }
  if (starList.length > 0) {
    return { ...offer, [tag]: average(starList) };
  } else {
    return offer;
  }
};
