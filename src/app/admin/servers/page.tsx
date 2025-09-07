"use client";

import { Header } from "@/common";
import {
  Button,
  Flex,
  Grid,
  Text,
  TextField,
  Badge,
  Card,
  Skeleton,
} from "@radix-ui/themes";
import axios from "axios";
import { useEffect, useState } from "react";

interface ServerForm {
  id?: number;
  name: string;
  host: string;
  port: number;
  rconPassword: string;
  note?: string;
  isEnabled?: boolean;
}

export default function AdminServers() {
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ServerForm>({
    name: "",
    host: "",
    port: 27015,
    rconPassword: "",
    note: "",
    isEnabled: true,
  });

  useEffect(() => {
    axios
      .get("/api/servers")
      .then((res) => setServers(res.data.servers ?? []))
      .finally(() => setLoading(false));
  }, []);

  const upsert = async () => {
    if (form.id) {
      const res = await axios.put("/api/servers", form);
      setServers((prev) =>
        prev.map((s) => (s.id === form.id ? res.data.server : s))
      );
    } else {
      const res = await axios.post("/api/servers", form);
      setServers((prev) => [res.data.server, ...prev]);
    }
    setForm({
      name: "",
      host: "",
      port: 27015,
      rconPassword: "",
      note: "",
      isEnabled: true,
    });
  };

  const del = async (id: number) => {
    await axios.delete(`/api/servers?id=${id}`);
    setServers((prev) => prev.filter((s) => s.id !== id));
  };

  const ping = async (id: number) => {
    const res = await axios.post("/api/servers/ping", { id });
    setServers((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              lastPingAt: new Date().toISOString(),
              lastPingMs: res.data.ms,
              reachable: res.data.ok,
            }
          : s
      )
    );
  };

  return (
    <Flex direction="column" gap="4">
      <Header>Admin • Servers</Header>

      <Grid columns={{ initial: "1", sm: "3" }} gap="3">
        <TextField.Root
          placeholder="Server name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <TextField.Root
          placeholder="Host/IP"
          value={form.host}
          onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
        />
        <TextField.Root
          placeholder="Port"
          type="number"
          value={form.port}
          onChange={(e) =>
            setForm((f) => ({ ...f, port: Number(e.target.value) }))
          }
        />
        <TextField.Root
          placeholder="RCON password"
          type="password"
          value={form.rconPassword}
          onChange={(e) =>
            setForm((f) => ({ ...f, rconPassword: e.target.value }))
          }
        />
        <TextField.Root
          placeholder="Note (optional)"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
        />
      </Grid>
      <Flex gap="2">
        <Button onClick={upsert}>{form.id ? "Update" : "Create"}</Button>
        {form.id ? (
          <Button
            color="gray"
            variant="soft"
            onClick={() =>
              setForm({
                name: "",
                host: "",
                port: 27015,
                rconPassword: "",
                note: "",
                isEnabled: true,
              })
            }
          >
            Clear
          </Button>
        ) : null}
      </Flex>

      <Flex direction="column" gap="2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton loading key={i}>
              <Card>
                <Flex
                  p="3"
                  justify="between"
                  align="center"
                  style={{ minHeight: 72 }}
                />
              </Card>
            </Skeleton>
          ))
        ) : servers.length === 0 ? (
          <Text color="gray">No servers.</Text>
        ) : (
          servers.map((s) => (
            <Card key={s.id}>
              <Flex p="3" justify="between" align="center">
                <Flex direction="column">
                  <Text weight="bold">{s.name}</Text>
                  <Text color="gray" size="1">
                    {s.host}:{s.port}
                  </Text>
                </Flex>
                <Flex align="center" gap="3">
                  {s.reachable != null ? (
                    <Badge color={s.reachable ? "green" : "red"}>
                      {s.reachable
                        ? `Reachable${s.lastPingMs ? ` (${s.lastPingMs}ms)` : ""}`
                        : "Unreachable"}
                    </Badge>
                  ) : null}
                  <Button
                    variant="soft"
                    onClick={() =>
                      setForm({
                        id: s.id,
                        name: s.name,
                        host: s.host,
                        port: s.port,
                        rconPassword: s.rconPassword,
                        note: s.note,
                        isEnabled: s.isEnabled,
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button onClick={() => ping(s.id)}>Ping</Button>
                  <Button color="red" variant="soft" onClick={() => del(s.id)}>
                    Delete
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))
        )}
      </Flex>
    </Flex>
  );
}
