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
import { useStore } from "../store";
import { modals } from "@mantine/modals";
import { useEffect, useState } from "react";

type Props = {
  getServer: () => void;
  data: Server;
};

function ServerItems({ data, getServer }: Readonly<Props>) {
  const { openModalUpdate, loadConnect, setLoadConnect, loadId } = useStore(
    (x) => x,
  );
  const [loading, setLoading] = useState<boolean>(false);

  const handleConnect = async (id: number) => {
    setLoadConnect(true, id);
    await StartSSHForward(id);
  };

  const handleDisConnect = async (id: number) => {
    setLoadConnect(true, id);
    await StopSSHForward(id);
  };

  const handleDelete = async (id: number) => {
    await DeleteConnection(id);
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

  useEffect(() => {
    setLoading(loadConnect);
    getServer();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadConnect, loadId]);
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
                loading={loading && loadId === data.id}
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
                loading={loading && loadId === data.id}
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
