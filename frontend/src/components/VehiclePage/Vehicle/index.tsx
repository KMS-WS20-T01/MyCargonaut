import { Card, Grid, IconButton, Typography } from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import React from "react";
import { GridElement } from "../../../util/GridElement";
import { VehicleIcon } from "../../../util/VehicleIcon";
import { useStyles } from "./Vehicle.style";

export interface VehicleProps {
  manufacturer: string;
  model: string;
  manufactureYear: number;
  seats: number;
  storageSpace: number;
}

export const Vehicle: React.FC<VehicleProps> = ({
  manufacturer,
  model,
  manufactureYear,
  seats,
  storageSpace,
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.root}>
      <Grid container alignItems="center" className={classes.grid}>
        <div style={{ marginLeft: 40, marginRight: 30 }}>
          <VehicleIcon />
        </div>
        <GridElement header="Hersteller">
          <Typography>{manufacturer}</Typography>
        </GridElement>
        <GridElement header="Modell">
          <Typography>{model}</Typography>
        </GridElement>
        <GridElement header="Baujahr">
          <Typography>{manufactureYear}</Typography>
        </GridElement>
        <GridElement header="Freie Sitze">
          <Typography>{seats}</Typography>
        </GridElement>
        <GridElement header="Stauraum">
          <Typography>{storageSpace}</Typography>
        </GridElement>
        <GridElement>
          <div style={{ borderLeft: "solid grey 2px" }}>
            <IconButton color="secondary">
              <Delete fontSize="large" />
            </IconButton>
          </div>
        </GridElement>
      </Grid>
    </Card>
  );
};