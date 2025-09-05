"use client";

import { Header } from "@/common";
import { Button, Flex, Grid, Text, TextField } from "@radix-ui/themes";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Maps() {
  const [maps, setMaps] = useState<{ id: number; display_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<number | null>(null);

  useEffect(() => {
    axios
      .get("/api/maps")
      .then((res) => setMaps(res.data.maps ?? []))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (editing) {
      const res = await axios.put("/api/maps", {
        id: editing,
        display_name: name,
      });
      setMaps((prev) => prev.map((m) => (m.id === editing ? res.data.map : m)));
      setEditing(null);
      setName("");
    } else {
      const res = await axios.post("/api/maps", { display_name: name });
      setMaps((prev) => [res.data.map, ...prev]);
      setName("");
    }
  };

  const del = async (id: number) => {
    await axios.delete(`/api/maps?id=${id}`);
    setMaps((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <Flex direction="column" gap="4">
      <Header>Maps</Header>

      <Grid columns={{ initial: "1", sm: "2" }} gap="3">
        <TextField.Root
          placeholder="Map display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={save}>{editing ? "Update" : "Create"}</Button>
        {editing ? (
          <Button
            color="gray"
            onClick={() => {
              setEditing(null);
              setName("");
            }}
          >
            Cancel
          </Button>
        ) : null}
      </Grid>

      <Flex direction="column" gap="2">
        {loading ? (
          <Text color="gray">Loading…</Text>
        ) : maps.length === 0 ? (
          <Text color="gray">No maps.</Text>
        ) : (
          maps.map((m) => (
            <Flex
              key={m.id}
              align="center"
              justify="between"
              p="3"
              style={{ border: "1px solid var(--gray-5)", borderRadius: 8 }}
            >
              <Text>{m.display_name}</Text>
              <Flex gap="2">
                <Button
                  variant="soft"
                  onClick={() => {
                    setEditing(m.id);
                    setName(m.display_name);
                  }}
                >
                  Edit
                </Button>
                <Button color="red" variant="soft" onClick={() => del(m.id)}>
                  Delete
                </Button>
              </Flex>
            </Flex>
          ))
        )}
      </Flex>
    </Flex>
  );
}
