import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import { FITCO_REEL_DURATION, FitcoReel } from "./FitcoReel";
import { CARD_HEIGHT, CARD_WIDTH, UnreadEmails } from "./UnreadEmails";
import {
  NO_NOTIFICATIONS_DURATION,
  NO_NOTIFICATIONS_HEIGHT,
  NO_NOTIFICATIONS_WIDTH,
  NoNotifications,
} from "./NoNotifications";
import { SEND_COMMUNICATION_DURATION, SendCommunication } from "./SendCommunication";
import { CLOSING_DURATION, Closing } from "./Closing";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        // You can take the "id" to render a video:
        // bunx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />
      <Composition
        id="FitcoReel"
        component={FitcoReel}
        durationInFrames={FITCO_REEL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="UnreadEmails"
        component={UnreadEmails}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="UnreadEmailsChroma"
        component={UnreadEmails}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ keyColor: "#ff00ff" }}
      />
      <Composition
        id="UnreadEmailsCard"
        component={UnreadEmails}
        durationInFrames={120}
        fps={30}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        defaultProps={{ cardOnly: true }}
      />
      <Composition
        id="NoNotifications"
        component={NoNotifications}
        durationInFrames={NO_NOTIFICATIONS_DURATION}
        fps={30}
        width={NO_NOTIFICATIONS_WIDTH}
        height={NO_NOTIFICATIONS_HEIGHT}
      />
      <Composition
        id="NoNotificationsChroma"
        component={NoNotifications}
        durationInFrames={NO_NOTIFICATIONS_DURATION}
        fps={30}
        width={NO_NOTIFICATIONS_WIDTH}
        height={NO_NOTIFICATIONS_HEIGHT}
        defaultProps={{ keyColor: "#ff00ff" }}
      />
      <Composition
        id="SendCommunication"
        component={SendCommunication}
        durationInFrames={SEND_COMMUNICATION_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Closing"
        component={Closing}
        durationInFrames={CLOSING_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
