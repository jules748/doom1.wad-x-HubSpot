import { Tile, Heading, Text, Button, Flex, hubspot } from "@hubspot/ui-extensions";

const DOOM_LOADER_URL = "https://jules748.github.io/doom1.wad-x-HubSpot/";

hubspot.extend(({ actions, context }) => (
  <DoomCard openIframe={actions.openIframeModal} context={context} />
));

const DoomCard = ({ openIframe, context }) => {
  const handleLaunch = () => {
    openIframe({
      uri: DOOM_LOADER_URL,
      height: 700,
      width: 1000,
      title: "DOOM in HubSpot",
      flush: true,
    });
  };

  return (
    <Tile>
      <Flex direction="column" gap="md">
        <Heading>DOOM</Heading>
        <Text variant="microcopy">
          Demo: HubSpot UI Extensions can run anything (even WebAssembly DOSBox).
        </Text>
        <Button variant="primary" onClick={handleLaunch}>
          Launch DOOM
        </Button>
      </Flex>
    </Tile>
  );
};
