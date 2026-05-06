import { Tile, Heading, Text, Button, Flex, Divider, hubspot } from "@hubspot/ui-extensions";

const DOOM_LOADER_URL = "https://jules748.github.io/doom1.wad-x-HubSpot/";

hubspot.extend(({ actions, context }) => (
  <DoomPage openIframe={actions.openIframeModal} context={context} />
));

const DoomPage = ({ openIframe, context }) => {
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
    <Flex direction="column" gap="md">
      <Tile>
        <Flex direction="row" justify="between" align="center">
          <Flex direction="column">
            <Heading>DOOM</Heading>
            <Text variant="microcopy">
              The original 1993 first-person shooter, running inside HubSpot via UI Extensions + js-dos (WebAssembly DOSBox).
            </Text>
          </Flex>
          <Button variant="primary" onClick={handleLaunch}>Launch DOOM</Button>
        </Flex>
      </Tile>

      <Tile>
        <Flex direction="column" gap="md">
          <Heading>About this app</Heading>
          <Text>This is a proof-of-concept demonstrating what's possible with HubSpot's UI Extensions platform. The full DOOM engine runs in your browser as WebAssembly, embedded in a modal iframe within a native HubSpot App Page.</Text>
          <Divider />
          <Heading>Stack</Heading>
          <Text>- HubSpot UI Extensions (Developer Platform 2026.03)</Text>
          <Text>- React + @hubspot/ui-extensions SDK</Text>
          <Text>- js-dos v8 (WebAssembly DOSBox)</Text>
          <Text>- DOOM shareware (id Software, 1993)</Text>
          <Text>- Hosted on GitHub Pages</Text>
          <Divider />
          <Heading>Why?</Heading>
          <Text>Because "It runs DOOM" is the universal benchmark for any programmable surface. If HubSpot UI Extensions can run DOOM, they can run anything your team actually needs.</Text>
          <Text variant="microcopy">Built by Jules Bellon - klakss.com</Text>
        </Flex>
      </Tile>
    </Flex>
  );
};
