import PropTypes from "prop-types";
import React from "react";
import { useSelector } from "react-redux";

import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

import ConnectButton from "./ConnectButton";

import { selectStatus } from "./deviceSlice";

export default function Device({
  error,
  handleDeviceConnect,
}) {
  const status = useSelector(selectStatus);

  return (
    <Stack
      paddingTop={2}
      spacing={2}
      sx={{ width: "100%" }}
    >
      {status !== "connected" &&
        <>
          { !error &&
            <Alert severity="warning">
              Connect your rooted goggles or airunit via USB, make sure they are powered and hit the connect button.
            </Alert>}

          { error &&
            <Alert severity="error">
              Could not connect to device, make sure that no other adb server is running on your machine and that you are not connected in another tab/window.
            </Alert>}

          <ConnectButton
            onClick={handleDeviceConnect}
          />
        </>}
    </Stack>
  );
}

Device.defaultProps = { error: false };

Device.propTypes = {
  error: PropTypes.bool,
  handleDeviceConnect: PropTypes.func.isRequired,
};