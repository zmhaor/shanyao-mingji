import { beforeEach, describe, expect, it, vi } from "vitest"

const requestMock = vi.fn()

vi.mock("@/http/axios", () => ({
  request: requestMock
}))

describe("admin content api", () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it("calls the reset sort order endpoint for the selected collection", async () => {
    requestMock.mockResolvedValue({ data: { collection_id: 7, updated_count: 3 } })

    const { contentApi } = await import("@/common/apis/admin/content")

    await contentApi.resetCollectionSortOrder(7)

    expect(requestMock).toHaveBeenCalledWith({
      url: "/admin/content/collections/7/reset-sort-order",
      method: "POST"
    })
  })
})
