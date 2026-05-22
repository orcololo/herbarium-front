import { afterEach, describe, expect, it, vi } from "vitest";
import { api, type CreateRegistryPayload } from "./api";

function mockStoredToken(initialToken: string | null) {
  let token = initialToken;
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key: string) => (key === "access_token" ? token : null)),
    setItem: vi.fn((key: string, value: string) => {
      if (key === "access_token") token = value;
    }),
    removeItem: vi.fn((key: string) => {
      if (key === "access_token") token = null;
    }),
  });
}

function mockJsonResponse(data: unknown = {}) {
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function lastFetch(fetchMock: ReturnType<typeof mockJsonResponse>) {
  const [url, init] = fetchMock.mock.calls.at(-1) ?? [];
  return {
    url: new URL(String(url), "http://localhost"),
    init: init as RequestInit,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api client contracts", () => {
  it("creates users through the admin users endpoint", async () => {
    const fetchMock = mockJsonResponse({ id: "user-1" });

    await api.users.create({
      name: "Ana Ribeiro",
      email: "ana@example.com",
      password: "strongPassword123",
      role: "researcher",
      institution: "Herbário Central",
    });

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/users");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      name: "Ana Ribeiro",
      email: "ana@example.com",
      password: "strongPassword123",
      role: "researcher",
      institution: "Herbário Central",
    });
  });

  it("updates the current profile without using admin-only user routes", async () => {
    const fetchMock = mockJsonResponse({ id: "current-user" });

    await api.users.updateProfile({
      name: "Ana Ribeiro",
      email: "ana@example.com",
      institution: "Herbário Central",
      avatar: "https://example.com/avatar.jpg",
    });

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/users/profile");
    expect(init.method).toBe("PATCH");
  });

  it("passes search and role filters to the users list endpoint", async () => {
    const fetchMock = mockJsonResponse({
      data: [],
      total: 0,
      page: 2,
      limit: 5,
    });

    await api.users.list({
      page: 2,
      limit: 5,
      search: "ana",
      role: "researcher",
    });

    const { url } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/users");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("limit")).toBe("5");
    expect(url.searchParams.get("search")).toBe("ana");
    expect(url.searchParams.get("role")).toBe("researcher");
  });

  it("deletes species through the species endpoint", async () => {
    const fetchMock = mockJsonResponse(undefined);

    await api.species.delete("species-1");

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/species/species-1");
    expect(init.method).toBe("DELETE");
  });

  it("normalizes species list ids returned as Mongo _id fields", async () => {
    mockJsonResponse({
      data: [
        { _id: "species-1", scientificName: "Mimosa pudica", isActive: true },
        { _id: "species-2", scientificName: "Coffea arabica", isActive: true },
      ],
      meta: { total: 2, page: 1, limit: 25 },
    });

    const result = await api.species.list({ page: 1, limit: 25 });

    expect(result.data.map((species) => species.id)).toEqual([
      "species-1",
      "species-2",
    ]);
  });

  it("searches taxa through the POWO proxy endpoint", async () => {
    const fetchMock = mockJsonResponse([]);

    await api.taxa.search({ q: "Mimosa", limit: 12 });

    const { url } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/taxa/search");
    expect(url.searchParams.get("q")).toBe("Mimosa");
    expect(url.searchParams.get("limit")).toBe("12");
  });

  it("pulls sync changes with query params", async () => {
    const fetchMock = mockJsonResponse({
      registries: [],
      sessions: [],
      syncedAt: "2026-05-22T00:00:00.000Z",
      hasMore: false,
    });

    await api.sync.pull({ since: "2026-05-01T00:00:00.000Z", limit: 25 });

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/sync/pull");
    expect(url.searchParams.get("since")).toBe("2026-05-01T00:00:00.000Z");
    expect(url.searchParams.get("limit")).toBe("25");
    expect(init.method).toBeUndefined();
  });

  it("pushes sync changes to the sync endpoint", async () => {
    const fetchMock = mockJsonResponse({
      registries: [],
      sessions: [],
      syncedAt: "2026-05-22T00:00:00.000Z",
    });

    await api.sync.push({
      deviceId: "web-admin",
      registries: [],
      sessions: [],
    });

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/sync/push");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      deviceId: "web-admin",
      registries: [],
      sessions: [],
    });
  });

  it("uploads audio as multipart form data", async () => {
    const fetchMock = mockJsonResponse({
      key: "audio/user/file.webm",
      url: "https://example.com/file.webm",
    });
    const audio = new File(["audio-bytes"], "note.webm", {
      type: "audio/webm",
    });

    await api.upload.audio(audio);

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/upload/audio");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
  });

  it("uploads images as multipart form data through the upload endpoint", async () => {
    const fetchMock = mockJsonResponse({
      key: "images/user/avatar.jpg",
      originalUrl: "https://example.com/avatar.jpg",
      thumbnailKey: "thumbnails/user/avatar.jpg",
      thumbnailUrl: "https://example.com/avatar-thumb.jpg",
    });
    const image = new File(["image-bytes"], "avatar.png", {
      type: "image/png",
    });

    const result = await api.upload.image(image);

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/upload/image");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect(
      (init.headers as Record<string, string>)["Content-Type"],
    ).toBeUndefined();
    expect(result.url).toBe("https://example.com/avatar.jpg");
    expect(result.thumbnailUrl).toBe("https://example.com/avatar-thumb.jpg");
  });

  it("refreshes expired tokens before retrying authenticated image uploads", async () => {
    mockStoredToken("old-token");
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), "http://localhost");
      if (fetchMock.mock.calls.length === 1) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
          statusText: "Unauthorized",
        });
      }
      if (url.pathname === "/api/v1/auth/refresh") {
        return new Response(
          JSON.stringify({ success: true, data: { accessToken: "new-token" } }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            key: "images/user/avatar.jpg",
            originalUrl: "https://example.com/avatar.jpg",
            thumbnailKey: "thumbnails/user/avatar.jpg",
            thumbnailUrl: "https://example.com/avatar-thumb.jpg",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const image = new File(["image-bytes"], "avatar.png", {
      type: "image/png",
    });

    const result = await api.upload.image(image);

    const [firstUploadUrl, firstUploadInit] = fetchMock.mock.calls[0];
    const [refreshUrl] = fetchMock.mock.calls[1];
    const [retryUploadUrl, retryUploadInit] = fetchMock.mock.calls[2];
    expect(new URL(String(firstUploadUrl), "http://localhost").pathname).toBe(
      "/api/v1/upload/image",
    );
    expect((firstUploadInit as RequestInit).headers).toEqual({
      Authorization: "Bearer old-token",
    });
    expect(new URL(String(refreshUrl), "http://localhost").pathname).toBe(
      "/api/v1/auth/refresh",
    );
    expect(new URL(String(retryUploadUrl), "http://localhost").pathname).toBe(
      "/api/v1/upload/image",
    );
    expect((retryUploadInit as RequestInit).headers).toEqual({
      Authorization: "Bearer new-token",
    });
    expect(result.url).toBe("https://example.com/avatar.jpg");
  });

  it("attaches registry images through the registry image endpoint", async () => {
    const fetchMock = mockJsonResponse({ id: "registry-1", images: [] });
    const image = new File(["image-bytes"], "specimen.png", {
      type: "image/png",
    });

    await api.registry.attachImage("registry-1", image);

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/registries/registry-1/images");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect(
      (init.headers as Record<string, string>)["Content-Type"],
    ).toBeUndefined();
  });

  it("removes registry images through the registry image endpoint", async () => {
    const fetchMock = mockJsonResponse({ id: "registry-1", images: [] });

    await api.registry.removeImage("registry-1", "images/user/specimen.jpg");

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe(
      "/api/v1/registries/registry-1/images/images/user/specimen.jpg",
    );
    expect(init.method).toBe("DELETE");
  });

  it("deletes registries through the registry delete endpoint", async () => {
    const fetchMock = mockJsonResponse(undefined);

    await api.registry.delete("registry-1");

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/registries/registry-1");
    expect(init.method).toBe("DELETE");
  });

  it("creates registries with cross-stack field payloads", async () => {
    const fetchMock = mockJsonResponse({ id: "registry-1" });
    const payload: CreateRegistryPayload = {
      uuid: "registry-uuid-1",
      registryIdentifier: "COL-2026-001",
      scientificName: "Mimosa pudica",
      commonName: "dormideira",
      family: "Fabaceae",
      genus: "Mimosa",
      speciesEpithet: "pudica",
      scientificAuthor: "L.",
      taxonStatus: "accepted",
      category: "herbs",
      dateCollected: "2026-05-22",
      latitude: -3.1,
      longitude: -60,
      altitude: 85,
      locality: "Reserva Ducke",
      municipality: "Manaus",
      state: "AM",
      country: "Brasil",
      phenologicalState: "flowering",
      phenologyFournier: "botão:3,flor:2",
      collectionMethod: "voucherCollected",
      collectorNumber: "AR-042",
      coCollectors: ["Ana Ribeiro"],
      numberOfIndividuals: 7,
      substrate: "solo argiloso",
      associatedTaxa: "Miconia sp.",
      vegetationType: "Mata Atlântica",
      topography: "encosta",
      determinationQualifier: "cf.",
      temperature: 26.5,
      humidity: 82,
      contributorName: "Ana Ribeiro",
      duplicateOf: "registry-uuid-original",
      iNaturalistId: "inat-123",
      caule: "ereto",
      folhaDescricao: "folhas compostas",
      florDescricao: "flores rosadas",
      frutoDescricao: "legume",
      sementeDescricao: "sementes pequenas",
      isDraft: true,
    };

    await api.registry.create(payload);

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/registries");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual(payload);
  });

  it("updates registry collection numbers through the registry endpoint", async () => {
    const fetchMock = mockJsonResponse({
      id: "registry-1",
      registryIdentifier: "COL-2026-001",
    });

    await api.registry.update("registry-1", {
      registryIdentifier: "COL-2026-001",
    });

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/registries/registry-1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({
      registryIdentifier: "COL-2026-001",
    });
  });

  it("updates registry species identity fields through the registry endpoint", async () => {
    const fetchMock = mockJsonResponse({ id: "registry-1" });

    await api.registry.update("registry-1", {
      scientificName: "Mimosa pudica",
      commonName: "dormideira",
      family: "Fabaceae",
      genus: "Mimosa",
      speciesEpithet: "pudica",
      category: "herbs",
    });

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/registries/registry-1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({
      scientificName: "Mimosa pudica",
      commonName: "dormideira",
      family: "Fabaceae",
      genus: "Mimosa",
      speciesEpithet: "pudica",
      category: "herbs",
    });
  });

  it("updates registry co-collectors through the registry endpoint", async () => {
    const fetchMock = mockJsonResponse({
      id: "registry-1",
      coCollectors: ["Ana Ribeiro", "Bruno Costa"],
    });

    await api.registry.update("registry-1", {
      coCollectors: ["Ana Ribeiro", "Bruno Costa"],
    });

    const { url, init } = lastFetch(fetchMock);
    expect(url.pathname).toBe("/api/v1/registries/registry-1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({
      coCollectors: ["Ana Ribeiro", "Bruno Costa"],
    });
  });
});
