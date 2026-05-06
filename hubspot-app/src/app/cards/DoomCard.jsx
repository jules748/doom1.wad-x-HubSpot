import { Tile, Heading, Text, Image, Flex, hubspot } from "@hubspot/ui-extensions";

const DOOM_LOADER_URL = "https://jules748.github.io/doom1.wad-x-HubSpot/";
const DOOM_PREVIEW_IMG = "https://upload.wikimedia.org/wikipedia/en/5/57/Doom_cover_art.jpg";

hubspot.extend(({ actions, context }) => (
  <DoomCard openIframe={actions.openIframeModal} context={context} />
));

const DoomCard = ({ openIframe, context }) => {
  const handleLaunch = () => {
    openIframe({
      uri: DOOM_LOADER_URL,
      height: 800,
      width: 1280,
      title: "DOOM in HubSpot — Click to Play",
      flush: true,
    });
  };

  return (
    <Tile>
      <Flex direction="column" gap="sm">
        <Heading>DOOM</Heading>
        <Text variant="microcopy">
          Click the cover to play DOOM (1993) directly in HubSpot. Demo of UI Extensions running WebAssembly DOSBox.
        </Text>
        <Image
          src={DOOM_PREVIEW_IMG}
          alt="DOOM cover art - click to play"
          onClick={handleLaunch}
          width={400}
        />
      </Flex>
    </Tile>
  );
};
