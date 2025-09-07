"use client";

import { Header } from "@/common";
import {
  Badge,
  Button,
  Flex,
  Grid,
  Text,
  TextArea,
  TextField,
  Select,
  Switch,
  Heading,
  Skeleton,
  Card,
} from "@radix-ui/themes";
import axios from "axios";
import Image from "next/image";
// Date picker removed per design; using manual date/time inputs
import { useEffect, useMemo, useRef, useState } from "react";

interface TournamentForm {
  id?: number;
  name: string;
  description: string;
  type: string;
  logo: string;
  banner: string;
  isActive: boolean;
  isPublic: boolean;
  isOpen: boolean;
  maxRating: number;
  startDate: string;
  endDate: string;
  maxTeams: number;
  formatConfig?: { serverIds?: number[]; autoPickCount?: number };
}

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<TournamentForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [maps, setMaps] = useState<{ id: number; display_name: string }[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [maxTeamsInput, setMaxTeamsInput] = useState<string>("16");
  const [maxRatingInput, setMaxRatingInput] = useState<string>("0");
  const [mapsLoading, setMapsLoading] = useState(true);
  const [serversLoading, setServersLoading] = useState(true);
  const [form, setForm] = useState<TournamentForm>({
    name: "",
    description: "",
    type: "SingleElimination",
    logo: "",
    banner: "/banner_example.png",
    isActive: true,
    isPublic: true,
    isOpen: true,
    maxRating: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    maxTeams: 16,
  });
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios
      .get("/api/tournaments")
      .then((res) => setTournaments(res.data.tournaments ?? []))
      .finally(() => setLoading(false));
    axios
      .get("/api/maps")
      .then((res) => setMaps(res.data.maps ?? []))
      .finally(() => setMapsLoading(false));
    axios
      .get("/api/servers")
      .then((res) => setServers(res.data.servers ?? []))
      .finally(() => setServersLoading(false));
  }, []);

  const upsert = async () => {
    const parsedMaxTeams = parseInt(maxTeamsInput, 10);
    const parsedMaxRating = parseInt(maxRatingInput, 10);
    const payload = {
      ...form,
      maxTeams: Number.isNaN(parsedMaxTeams) ? form.maxTeams : parsedMaxTeams,
      maxRating: Number.isNaN(parsedMaxRating) ? 0 : parsedMaxRating,
    } as typeof form;
    if (form.id) {
      const res = await axios.put("/api/tournaments", payload);
      setTournaments((prev) =>
        prev.map((t) => (t.id === form.id ? res.data.tournament : t))
      );
    } else {
      const res = await axios.post("/api/tournaments", payload);
      setTournaments((prev) => [res.data.tournament, ...prev]);
    }
    setForm({
      name: "",
      description: "",
      type: "SingleElimination",
      logo: "",
      banner: "/banner_example.png",
      isActive: true,
      isPublic: true,
      isOpen: true,
      maxRating: 0,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      maxTeams: 16,
    });
    setMaxTeamsInput("16");
    setMaxRatingInput("0");
  };

  const edit = (t: TournamentForm) =>
    setForm({
      ...t,
      startDate: new Date(t.startDate).toISOString(),
      endDate: new Date(t.endDate).toISOString(),
      // Normalize legacy single serverId into serverIds array if present
      formatConfig: ((): any => {
        const fc: any = (t as any).formatConfig ?? {};
        if (fc && Array.isArray(fc.serverIds)) return fc;
        if (fc && typeof fc.serverId === "number")
          return { ...fc, serverIds: [fc.serverId] };
        return fc;
      })(),
    });
  useEffect(() => {
    // Sync string inputs when editing/loading a tournament into the form
    if (form.maxTeams !== undefined) setMaxTeamsInput(String(form.maxTeams));
    if (form.maxRating !== undefined) setMaxRatingInput(String(form.maxRating));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id]);
  const del = async (id: number) => {
    await axios.delete(`/api/tournaments?id=${id}`);
    setTournaments((prev) => prev.filter((t) => t.id !== id));
  };

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await axios.post("/api/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url as string;
  };

  function getDateFromISO(iso: string) {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function getTimeFromISO(iso: string) {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function setDatePart(iso: string, dateStr: string) {
    const d = new Date(iso);
    const [y, m, da] = dateStr.split("-").map((n) => Number(n));
    if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(da)) {
      d.setFullYear(y, m - 1, da);
    }
    return d.toISOString();
  }

  function setTimePart(iso: string, time: string) {
    const d = new Date(iso);
    const [h, m] = time.split(":").map((n) => Number(n));
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      d.setHours(h, m, 0, 0);
    }
    return d.toISOString();
  }

  // removed duplicate helpers after reverting calendar
  function computeRequiredServersLocal(type: string, maxTeams: number) {
    const teams = Math.max(2, Number(maxTeams) || 2);
    switch (type) {
      case "SingleElimination":
      case "Swiss":
      case "RoundRobin":
        return Math.ceil(teams / 2);
      case "DoubleElimination":
        return Math.ceil(teams / 2) + Math.ceil(teams / 4);
      default:
        return Math.ceil(teams / 2);
    }
  }

  return (
    <Flex direction="column" gap="4">
      <Header>Admin • Tournaments</Header>

      {/* Form */}
      <Grid columns={{ initial: "1", sm: "2" }} gap="3">
        <Flex direction="column" gap="1">
          <Heading size="2">Tournament name</Heading>
          <TextField.Root
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </Flex>
        <Flex direction="column" gap="1">
          <Heading size="2">Bracket type</Heading>
          <Select.Root
            value={form.type}
            onValueChange={(value) => setForm((f) => ({ ...f, type: value }))}
          >
            <Select.Trigger placeholder="Select type" />
            <Select.Content>
              <Select.Group>
                <Select.Item value="SingleElimination">
                  Single Elimination (SE)
                </Select.Item>
                <Select.Item value="DoubleElimination">
                  Double Elimination (DE)
                </Select.Item>
                <Select.Item value="Swiss">Swiss System</Select.Item>
                <Select.Item value="RoundRobin">Round Robin</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Flex>

        {/* Banner upload only */}
        <Flex direction="column" gap="2">
          <Heading size="2">Banner image</Heading>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = await upload(file);
              setForm((f) => ({ ...f, banner: url }));
              e.currentTarget.value = "";
            }}
          />
          {form.banner ? (
            <>
              <Image
                src={form.banner}
                alt="Banner preview"
                width={400}
                height={120}
                style={{ objectFit: "cover", borderRadius: 8 }}
              />
              <Flex gap="2">
                <Button onClick={() => bannerInputRef.current?.click()}>
                  Replace
                </Button>
                <Button
                  color="red"
                  variant="soft"
                  onClick={() => setForm((f) => ({ ...f, banner: "" }))}
                >
                  Remove
                </Button>
              </Flex>
            </>
          ) : (
            <Button onClick={() => bannerInputRef.current?.click()}>
              Upload banner
            </Button>
          )}
        </Flex>

        {/* Logo URL + upload */}
        <Flex direction="column" gap="2">
          <Heading size="2">Logo image</Heading>
          <Flex gap="2">
            <TextField.Root
              placeholder="Logo URL"
              value={form.logo}
              onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))}
            />
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await upload(file);
                setForm((f) => ({ ...f, logo: url }));
                e.currentTarget.value = "";
              }}
            />
            <Button onClick={() => logoInputRef.current?.click()}>
              Upload
            </Button>
          </Flex>
          {form.logo ? (
            <Image
              src={form.logo}
              alt="Logo preview"
              width={120}
              height={120}
              style={{ objectFit: "cover", borderRadius: 8 }}
            />
          ) : null}
        </Flex>
        <Flex direction="column" gap="1">
          <Heading size="2">Max teams</Heading>
          <TextField.Root
            placeholder="Max Teams"
            type="number"
            value={maxTeamsInput}
            onChange={(e) => setMaxTeamsInput(e.target.value)}
            onBlur={() => {
              const n = parseInt(maxTeamsInput, 10);
              if (!Number.isNaN(n)) setForm((f) => ({ ...f, maxTeams: n }));
            }}
          />
        </Flex>
        <Flex direction="column" gap="1">
          <Heading size="2">Max rating (0 = unlimited)</Heading>
          <TextField.Root
            placeholder="Max Rating (0 = unlimited)"
            type="number"
            value={maxRatingInput}
            onChange={(e) => setMaxRatingInput(e.target.value)}
            onBlur={() => {
              const n = parseInt(maxRatingInput, 10);
              if (!Number.isNaN(n)) setForm((f) => ({ ...f, maxRating: n }));
            }}
          />
        </Flex>
        <Flex direction="column" gap="1">
          <Heading size="2">Start date & time</Heading>
          <Flex gap="2">
            <TextField.Root
              type="date"
              value={getDateFromISO(form.startDate)}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  startDate: setDatePart(f.startDate, e.target.value),
                }))
              }
            />
            <TextField.Root
              type="time"
              value={getTimeFromISO(form.startDate)}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  startDate: setTimePart(f.startDate, e.target.value),
                }))
              }
            />
          </Flex>
        </Flex>
        <Flex direction="column" gap="1">
          <Heading size="2">End date & time</Heading>
          <Flex gap="2">
            <TextField.Root
              type="date"
              value={getDateFromISO(form.endDate)}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  endDate: setDatePart(f.endDate, e.target.value),
                }))
              }
            />
            <TextField.Root
              type="time"
              value={getTimeFromISO(form.endDate)}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  endDate: setTimePart(f.endDate, e.target.value),
                }))
              }
            />
          </Flex>
        </Flex>
        <Flex direction="column" gap="1">
          <Heading size="2">Description</Heading>
          <TextArea
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </Flex>
      </Grid>
      {/* Server capacity (auto-pick on start) */}
      <Flex direction="column" gap="2">
        <Heading size="2">Server capacity</Heading>
        {serversLoading ? (
          <Skeleton loading>
            <Card>
              <Flex style={{ minHeight: 72 }} />
            </Card>
          </Skeleton>
        ) : (
          (() => {
            const serversEnabled = servers.filter((s) => s.isEnabled).length;
            const start = new Date(form.startDate);
            const end = new Date(form.endDate);
            const overlaps = tournaments.filter(
              (t) =>
                (!form.id || t.id !== form.id) &&
                new Date(t.endDate) >= start &&
                new Date(t.startDate) <= end
            );
            const overlapRequired = overlaps.reduce(
              (acc, t) => acc + computeRequiredServersLocal(t.type, t.maxTeams),
              0
            );
            const thisRequired = computeRequiredServersLocal(
              form.type,
              form.maxTeams
            );
            const totalNeeded = overlapRequired + thisRequired;
            const ok = serversEnabled >= totalNeeded;
            return (
              <Card>
                <Flex direction="column" p="3" gap="2">
                  <Text weight="bold">Capacity check</Text>
                  <Text color={ok ? "green" : "red"}>
                    Servers enabled: {serversEnabled} • Needed during overlap:{" "}
                    {totalNeeded}
                  </Text>
                  {overlaps.length > 0 ? (
                    <Text color="gray" size="1">
                      Overlapping tournaments ({overlaps.length}):{" "}
                      {overlaps
                        .slice(0, 3)
                        .map((t) => t.name)
                        .join(", ")}
                      {overlaps.length > 3 ? "…" : ""}
                    </Text>
                  ) : (
                    <Text color="gray" size="1">
                      No overlapping tournaments in the selected window.
                    </Text>
                  )}
                  {!ok && (
                    <Text color="red" size="1">
                      Warning: Not enough servers available. Servers will be
                      auto-picked at start.
                    </Text>
                  )}
                </Flex>
              </Card>
            );
          })()
        )}
      </Flex>
      {/* Maps selection */}
      <Flex direction="column" gap="2">
        <Heading size="2">Available maps</Heading>
        {mapsLoading ? (
          <Flex direction="column" gap="2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton loading key={i}>
                <Card>
                  <Flex style={{ minHeight: 36 }} />
                </Card>
              </Skeleton>
            ))}
          </Flex>
        ) : (
          <Grid columns="2" gap="2">
            {maps.map((m) => {
              const selected = (form as any).mapIds?.includes(m.id) ?? false;
              return (
                <label
                  key={m.id}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => {
                      setForm((f) => {
                        const current = ((f as any).mapIds ?? []) as number[];
                        const next = e.target.checked
                          ? Array.from(new Set([...current, m.id]))
                          : current.filter((id) => id !== m.id);
                        return { ...(f as any), mapIds: next } as any;
                      });
                    }}
                  />
                  <Text>{m.display_name}</Text>
                </label>
              );
            })}
          </Grid>
        )}
      </Flex>
      {/* Toggles */}
      <Flex direction="column" gap="2">
        <Heading size="2">Visibility & registration</Heading>
        <Flex gap="5" align="center" wrap="wrap">
          <Flex align="center" gap="2">
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            />
            <Text>
              Active (tournament is ongoing or scheduled; not archived)
            </Text>
          </Flex>
          <Flex align="center" gap="2">
            <Switch
              checked={form.isPublic}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isPublic: v }))}
            />
            <Text>Public (visible on listings for everyone)</Text>
          </Flex>
          <Flex align="center" gap="2">
            <Switch
              checked={form.isOpen}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isOpen: v }))}
            />
            <Text>
              Open (teams can register; closed means invite-only or full)
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Flex gap="2">
        <Button onClick={upsert}>{form.id ? "Update" : "Create"}</Button>
        {form.id ? (
          <Button
            color="gray"
            onClick={() =>
              setForm({
                name: "",
                description: "",
                type: "SingleElimination",
                logo: "",
                banner: "/banner_example.png",
                isActive: true,
                isPublic: true,
                isOpen: true,
                maxRating: 0,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 86400000).toISOString(),
                maxTeams: 16,
              })
            }
          >
            Clear
          </Button>
        ) : null}
      </Flex>

      {/* List */}
      <Flex direction="column" gap="2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton loading key={i}>
              <Card>
                <Flex
                  p="3"
                  justify="between"
                  align="center"
                  style={{ minHeight: 64 }}
                />
              </Card>
            </Skeleton>
          ))
        ) : tournaments.length === 0 ? (
          <Text color="gray">No tournaments.</Text>
        ) : (
          tournaments.map((t) => (
            <Flex
              key={t.id}
              align="center"
              justify="between"
              p="3"
              style={{ border: "1px solid var(--gray-5)", borderRadius: 8 }}
            >
              <Flex direction="column">
                <Text weight="bold">{t.name}</Text>
                <Text color="gray" size="1">
                  {t.type}
                </Text>
              </Flex>
              <Flex gap="2">
                <Button variant="soft" onClick={() => edit(t)}>
                  Edit
                </Button>
                <Button color="red" variant="soft" onClick={() => del(t.id!)}>
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
