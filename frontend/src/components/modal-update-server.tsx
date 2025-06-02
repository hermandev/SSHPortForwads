import {
  Button,
  Grid,
  Group,
  Modal,
  NumberInput,
  PasswordInput,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { useStore } from "../store";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { FormServerSchema, type FormServer } from "../type";
import { zodResolver } from "mantine-form-zod-resolver";
import { useEffect, useTransition } from "react";
import { UpdateConnection } from "../../wailsjs/go/main/App";

const initialValues = {
  id: 0,
  name: "",
  ip: "",
  ssh_user: "",
  ssh_pass: "",
  ssh_key: "",
  ssh_port: 22,
  db_port: 3306,
  local_port: 3307,
  con_status: 0,
};

function ModalUpdateServer() {
  const [isPending, startTransition] = useTransition();
  const { modalUpdate, openModalUpdate, selectedData } = useStore((x) => x);
  const close = () => openModalUpdate(!modalUpdate, null);

  const form = useForm<FormServer>({
    initialValues: initialValues,
    validate: zodResolver(FormServerSchema),
  });

  const handleSubmit = (data: FormServer) => {
    startTransition(() => {
      // console.log(data);
      UpdateConnection({
        id: data.id,
        name: data.name,
        ip: data.ip,
        ssh_user: data.ssh_user,
        ssh_pass: data.ssh_pass,
        ssh_port: data.ssh_port,
        db_port: data.db_port,
        desc: "",
        ssh_key: "",
        local_port: data.local_port,
        con_status: 0,
      }).then(() => {
        form.setInitialValues(initialValues);
        close();
      });
    });
  };

  useEffect(() => {
    if (selectedData) {
      form.setValues({
        id: selectedData.id,
        name: selectedData.name,
        ip: selectedData.ip,
        ssh_user: selectedData.ssh_user,
        ssh_pass: selectedData.ssh_pass,
        ssh_port: selectedData.ssh_port,
        db_port: selectedData.db_port,
        ssh_key: selectedData.ssh_key,
        local_port: selectedData.local_port,
        con_status: selectedData.con_status,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalUpdate]);
  return (
    <Modal
      opened={modalUpdate}
      onClose={close}
      title="Update Server"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <form onSubmit={form.onSubmit((value) => handleSubmit(value))}>
        <SimpleGrid mb="sm">
          <TextInput
            label="Label"
            placeholder="ex: Name of Server"
            size="xs"
            variant="filled"
            {...form.getInputProps("name")}
          />
        </SimpleGrid>
        <Grid mb="sm">
          <Grid.Col span="auto">
            <TextInput
              label="Hostname"
              placeholder="ex: 192.0.0.xxx.xxx"
              size="xs"
              variant="filled"
              {...form.getInputProps("ip")}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="SSH Port"
              placeholder="ex: 22"
              size="xs"
              hideControls
              variant="filled"
              {...form.getInputProps("ssh_port")}
            />
          </Grid.Col>
        </Grid>
        <SimpleGrid cols={2} mb="sm">
          <TextInput
            label="Username"
            placeholder="ex: root"
            size="xs"
            variant="filled"
            {...form.getInputProps("ssh_user")}
          />
          <PasswordInput
            label="Password"
            placeholder="xxxxx"
            size="xs"
            variant="filled"
            {...form.getInputProps("ssh_pass")}
          />
        </SimpleGrid>
        <Group mb="sm" justify="space-between" align="end">
          <NumberInput
            label="Remote Port"
            placeholder="ex: 3306"
            size="xs"
            hideControls
            variant="filled"
            {...form.getInputProps("db_port")}
          />
          <IconArrowNarrowRight />
          <NumberInput
            label="Local Port"
            placeholder="ex: 3307"
            size="xs"
            variant="filled"
            hideControls
            {...form.getInputProps("local_port")}
          />
        </Group>
        <Group mt="xl" justify="end">
          <Button
            size="xs"
            variant="outline"
            color="gray"
            disabled={isPending}
            onClick={close}
          >
            Cancel
          </Button>
          <Button size="xs" loading={isPending} type="submit">
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  );
}

export default ModalUpdateServer;
