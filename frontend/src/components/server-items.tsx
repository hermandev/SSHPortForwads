import {
  ActionIcon,
  ActionIconGroup,
  Box,
  Button,
  Group,
  Paper,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import type { Server } from "../type";
import {
  IconServer,
  IconPlugConnected,
  IconEdit,
  IconTrash,
  IconPlugConnectedX,
} from "@tabler/icons-react";
import {
  StartSSHForward,
  StopSSHForward,
  DeleteConnection,
} from "../../wailsjs/go/main/App";
import { useTransition } from "react";
import { useStore } from "../store";
import { modals } from "@mantine/modals";

type Props = {
  getServer: () => void;
  data: Server;
};

function ServerItems({ data, getServer }: Readonly<Props>) {
  const { openModalUpdate } = useStore((x) => x);
  const [isPending, startTransition] = useTransition();
  const handleConnect = (id: number) => {
    startTransition(() => {
      StartSSHForward(id).then(() => {
        return getServer();
      });
      return getServer();
    });
  };

  const handleDisConnect = (id: number) => {
    startTransition(() => {
      StopSSHForward(id).then(() => {
        return getServer();
      });
      return getServer();
    });
  };

  const handleDelete = (id: number) => {
    startTransition(() => {
      DeleteConnection(id).then(() => {
        return getServer();
      });
      return getServer();
    });
  };

  const handleModalDelete = (id: number) =>
    modals.openConfirmModal({
      title: "Please confirm!",
      children: (
        <Text size="sm">Are you sure you want to delete this host </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => handleDelete(id),
    });
  return (
    <Paper withBorder radius="md" p="sm" mt="md">
      <Group justify="space-between">
        <Group>
          <ThemeIcon size="lg">
            <IconServer style={{ width: "70%", height: "70%" }} />
          </ThemeIcon>
          <Box>
            <Text>{data.name}</Text>
            <Text size="xs">
              {`IP: ${data.ip}:${data.db_port} --> Local Port ${data.local_port}`}
            </Text>
          </Box>
        </Group>
        <Group>
          {data.con_status === 0 ? (
            <Tooltip label="Start Connect" withArrow>
              <Button
                leftSection={<IconPlugConnected size="1rem" />}
                size="xs"
                variant="light"
                onClick={() => handleConnect(data.id)}
                loading={isPending}
                color="green"
              >
                Connect
              </Button>
            </Tooltip>
          ) : (
            <Tooltip label="Disconnect" withArrow>
              <Button
                leftSection={<IconPlugConnectedX size="1rem" />}
                size="xs"
                variant="light"
                onClick={() => handleDisConnect(data.id)}
                loading={isPending}
                color="red"
              >
                Disconnect
              </Button>
            </Tooltip>
          )}
          <ActionIconGroup>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => openModalUpdate(true, data)}
            >
              <IconEdit size="1rem" />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => handleModalDelete(data.id)}
            >
              <IconTrash size="1rem" />
            </ActionIcon>
          </ActionIconGroup>
        </Group>
      </Group>
    </Paper>
  );
}

export default ServerItems;
