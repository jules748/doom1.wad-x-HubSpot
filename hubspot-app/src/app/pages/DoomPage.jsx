import React, { useState, useEffect } from "react";
import {
  Flex,
  Box,
  Text,
  Heading,
  Button,
  Tile,
  Divider,
  hubspot,
} from "@hubspot/ui-extensions";
import { Iframe } from "@hubspot/ui-extensions/experimental";
import { createPageRouter, PageRoutes } from "@hubspot/ui-extensions/pages";

const DOOM_LOADER_URL = "https://jules748.github.io/doom1.wad-x-HubSpot/";

const DoomHomePage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "doom:ready") {
        setIframeReady(true);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <Flex direction="column" gap="md">
      <Tile>
        <Flex direction="row" justify="between" align="center">
          <Box>
            <Heading>DOOM</Heading>
            <Text variant="microcopy">
              The original 1993 first-person shooter, running inside HubSpot
              via UI Extensions + js-dos (WebAssembly DOSBox).
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
              {iframeReady ? "Loaded - click the iframe to play" : "Loading WASM runtime..."}
            </Text>
            <Text variant="microcopy">
              Controls: arrow keys to move - Ctrl to fire - Space to open doors - Esc for menu
            </Text>
            <Box>
              <Iframe
                src={DOOM_LOADER_URL}
                height="lg"
              />
            </Box>
          </Flex>
        </Tile>
      )}

      {!isPlaying && (
        <Tile>
          <Flex direction="column" gap="md">
            <Heading>About this app</Heading>
            <Text>
              This is a proof-of-concept demonstrating what's possible with
              HubSpot's UI Extensions platform. The full DOOM engine runs in
              your browser as WebAssembly, embedded in an Iframe component
              within a native HubSpot App Page.
            </Text>
            <Divider />
            <Heading>Stack</Heading>
            <Text>- HubSpot UI Extensions (Developer Platform 2026.03)</Text>
            <Text>- React + @hubspot/ui-extensions SDK</Text>
            <Text>- js-dos v8 (WebAssembly DOSBox)</Text>
            <Text>- DOOM shareware (id Software, 1993)</Text>
            <Text>- Hosted on GitHub Pages</Text>
            <Divider />
            <Heading>Why?</Heading>
            <Text>
              Because "It runs DOOM" is the universal benchmark for any
              programmable surface. If HubSpot UI Extensions can run DOOM,
              they can run anything your team actually needs.
            </Text>
            <Box>
              <Text variant="microcopy">
                Built by Jules Bellon - klakss.com - Portal 145045793
              </Text>
            </Box>
          </Flex>
        </Tile>
      )}
    </Flex>
  );
};

const PageRouter = createPageRouter(
  <PageRoutes>
    <PageRoutes.IndexRoute component={DoomHomePage} />
  </PageRoutes>,
);

hubspot.extend(() => <PageRouter />);
