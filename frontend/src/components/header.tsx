import { Button, Grid, TextInput } from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useStore } from "../store";

function Header() {
  const { handleSearch, openModalAdd } = useStore((x) => x);
  return (
    <Grid>
      <Grid.Col span="auto">
        <TextInput
          placeholder="Find label or host..."
          width="100%"
          size="xs"
          leftSection={<IconSearch size="1rem" />}
          variant="filled"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </Grid.Col>
      <Grid.Col span={2}>
        <Button
          leftSection={<IconPlus size="1rem" />}
          size="xs"
          onClick={() => openModalAdd(true)}
        >
          Add Server
        </Button>
      </Grid.Col>
    </Grid>
  );
}

export default Header;
