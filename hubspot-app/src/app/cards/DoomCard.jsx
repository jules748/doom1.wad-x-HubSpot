import React, { useState, useEffect } from "react";
import {
  Flex,
  Box,
  Text,
  Heading,
  Button,
  Tile,
  Iframe,
  hubspot,
} from "@hubspot/ui-extensions";

const DOOM_LOADER_URL = "https://jules748.github.io/doom1.wad-x-HubSpot/";

hubspot.extend(({ context, actions }) => (
  <DoomCard fetchCrmObjectProperties={actions.fetchCrmObjectProperties} />
));

const DoomCard = ({ fetchCrmObjectProperties }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [companyName, setCompanyName] = useState(null);

  useEffect(() => {
    if (fetchCrmObjectProperties) {
      fetchCrmObjectProperties(["name"])
        .then((props) => {
          if (props && props.name) {
            setCompanyName(props.name);
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <Flex direction="column" gap="md">
      <Tile>
        <Flex direction="row" justify="between" align="center">
          <Box>
            <Heading>DOOM</Heading>
            <Text variant="microcopy">
              {companyName
                ? "Playing DOOM on " + companyName + "'s record"
                : "Demo: HubSpot UI Extensions can run anything (even WebAssembly DOSBox)"}
            </Text>
          </Box>
          <Flex direction="row" gap="sm">
            {!isPlaying ? (
              <Button variant="primary" onClick={() => setIsPlaying(true)}>
                Launch DOOM
              </Button>
            ) : (
              <Button variant="destructive" onClick={() => setIsPlaying(false)}>
                Stop
              </Button>
            )}
          </Flex>
        </Flex>
      </Tile>

      {isPlaying && (
        <Tile>
          <Flex direction="column" gap="sm">
            <Text format={{ fontWeight: "demibold" }}>
              Click the iframe to play
            </Text>
            <Text variant="microcopy">
              Controls: arrow keys to move - Ctrl to fire - Space to open doors - Esc for menu
            </Text>
            <Box>
              <Iframe
                src={DOOM_LOADER_URL}
                height={500}
                width="100%"
                title="DOOM"
                sandbox={[
                  "allow-scripts",
                  "allow-same-origin",
                  "allow-pointer-lock",
                  "allow-popups",
                ]}
                allow="autoplay; gamepad; fullscreen"
              />
            </Box>
          </Flex>
        </Tile>
      )}
    </Flex>
  );
};
