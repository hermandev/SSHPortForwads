import { Container, Paper, ScrollArea } from "@mantine/core";
import Header from "./components/header";
import { useStore } from "./store";
import ModalAddServer from "./components/modal-add-server";
import { useEffect, useTransition } from "react";
import { LoadConnections } from "../wailsjs/go/main/App";
import { EventsOff, EventsOn } from "../wailsjs/runtime/runtime";
import type { Server } from "./type";
import ServerItems from "./components/server-items";
import { useElementSize } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import ModalUpdateServer from "./components/modal-update-server";

function App() {
  const { search, server, modalAdd, setServerData } = useStore((x) => x);
  const [isPending, startTransition] = useTransition();
  const { ref, height } = useElementSize();

  const handleGetServer = () => {
    startTransition(async () => {
      try {
        if (LoadConnections) {
          const result = await LoadConnections();
          if (result) {
            setServerData(result as Server[]);
          } else {
            setServerData([]);
          }
        }
      } catch (err) {
        console.log(err);
      }
    });
  };

  useEffect(() => {
    handleGetServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!modalAdd) {
      handleGetServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalAdd]);

  useEffect(() => {
    EventsOn("status", (result) => {
      notifications.show({
        title: "Status",
        message: result,
      });
    });

    return () => {
      EventsOff("status");
    };
  }, []);
  return (
    <>
      <Container p="sm">
        <Header />
        <Paper
          withBorder
          mt="md"
          h="85vh"
          bg="var(--mantine-color-gray-0)"
          ref={ref}
        >
          <ScrollArea h={height - 10} px="xs">
            {search}
            {isPending && "Load Data..."}
            {server.map((item: Server) => (
              <ServerItems
                data={item}
                key={item.id}
                getServer={handleGetServer}
              />
            ))}
          </ScrollArea>
        </Paper>
      </Container>
      <ModalAddServer />
      <ModalUpdateServer />
    </>
  );
}

export default App;
