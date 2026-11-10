import {
  Button,
  Container,
  CopyButton,
  DataList,
  Divider,
  FileInput,
  Group,
  Skeleton,
  Stack,
  Tabs,
  Textarea,
  Title,
} from "@mantine/core";
import { CatchBoundary, createFileRoute } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { brotliCompress, brotliDecompress } from "brotli-wasm-2";
import { Suspense, use, useMemo, useState } from "react";
import * as z from "zod";

import { encodeBase64Url, decodeBase64Url } from "../utils/base64";
import { encodeHex } from "../utils/hex";
import { saveFile } from "../utils/saveFile";
import { decodeUtf8, encodeUtf8 } from "../utils/utf8";

const getBaseUrl = createIsomorphicFn()
  .client(() => window.location.origin)
  .server(() => "https://brotli-wasm-demo.jeremynguyen.workers.dev");

const CopyUrl = ({ base64Url }: { base64Url: string }) => {
  return (
    <CopyButton
      value={`${new URL(
        `?${new URLSearchParams({
          q: base64Url,
        })}`,
        getBaseUrl(),
      )}`}
    >
      {({ copied, copy }) => (
        <Button color={copied ? "teal" : "blue"} onClick={copy}>
          {copied ? "Copied url" : "Copy url"}
        </Button>
      )}
    </CopyButton>
  );
};

const CompressedData = ({
  input,
  fileName,
}: {
  input: string | Promise<Uint8Array<ArrayBuffer>>;
  fileName: string;
}) => {
  const inputData = typeof input === "string" ? encodeUtf8(input) : use(input);
  const compressedOutput = useMemo(
    () => brotliCompress(inputData) ?? new Uint8Array(),
    [inputData],
  );
  const base64Url = useMemo(
    () => encodeBase64Url(compressedOutput),
    [compressedOutput],
  );

  return (
    <>
      <DataList>
        {[
          {
            label: "Original size",
            value: inputData.length.toLocaleString(undefined, {
              style: "unit",
              unit: "byte",
            }),
          },
          {
            label: "Compressed size",
            value: compressedOutput.length.toLocaleString(undefined, {
              style: "unit",
              unit: "byte",
            }),
          },
          {
            label: "Space saved (%)",
            value: (
              1 -
              inputData.length / compressedOutput.length
            ).toLocaleString(undefined, {
              style: "percent",
              minimumFractionDigits: 2,
            }),
          },
        ].map((item) => (
          <DataList.Item key={item.label}>
            <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
            <DataList.ItemValue>{item.value}</DataList.ItemValue>
          </DataList.Item>
        ))}
      </DataList>

      <Divider />

      <Stack gap="md">
        <Group>
          <CatchBoundary
            getResetKey={() => base64Url}
            errorComponent={() => (
              <>An error occurred while constructing the URL</>
            )}
          >
            <CopyUrl base64Url={base64Url} />
          </CatchBoundary>
          <Button
            variant="filled"
            color="dark"
            onClick={() => {
              saveFile(
                typeof input === "string" ?
                  new File([compressedOutput], "data.bin.br")
                : new File([compressedOutput], `${fileName}`),
              );
            }}
          >
            Download
          </Button>
        </Group>
        <Textarea autosize label="Base64URL" value={base64Url} readOnly />
        <Textarea
          autosize
          label="Hex"
          value={encodeHex(compressedOutput)}
          readOnly
        />
      </Stack>
    </>
  );
};

const Home = () => {
  const loaderData = Route.useLoaderData();
  const loaderDataAsUtf8 = useMemo(
    () =>
      loaderData.data !== undefined ? decodeUtf8(loaderData.data) : undefined,
    [loaderData],
  );
  const [currTab, setCurrTab] = useState(
    loaderData.data !== undefined ?
      loaderDataAsUtf8 !== undefined ?
        "text"
      : "file"
    : "text",
  );
  const [textInput, setTextInput] = useState(loaderDataAsUtf8 ?? "");
  const [fileInput, setFileInput] = useState(
    loaderData.data !== undefined && loaderDataAsUtf8 === undefined ?
      new File([loaderData.data], "data.bin")
    : null,
  );

  return (
    <Container>
      <Stack>
        <Title order={2}>Input</Title>
        <Tabs value={currTab} onChange={(value) => setCurrTab(value ?? "text")}>
          <Tabs.List mb={8}>
            <Tabs.Tab value="text">Text</Tabs.Tab>
            <Tabs.Tab value="file">File</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="text">
            <Textarea
              autosize
              label="UTF-8 text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          </Tabs.Panel>
          <Tabs.Panel value="file">
            <FileInput
              label="Input"
              placeholder="File"
              value={fileInput}
              onChange={setFileInput}
            />
          </Tabs.Panel>
        </Tabs>

        <Divider mt={8} />

        <Title order={2}>Output</Title>
        <Suspense fallback={<Skeleton>Suspending</Skeleton>}>
          <CompressedData
            input={
              currTab === "text" ? textInput
              : fileInput !== null ?
                fileInput
                  .arrayBuffer()
                  .then((arrayBuffer) => new Uint8Array(arrayBuffer))
              : ""
            }
            fileName={
              currTab === "text" ? "data.txt.br" : (
                `${fileInput?.name ?? "data.bin"}.br`
              )
            }
          />
        </Suspense>
      </Stack>
    </Container>
  );
};

const Route = createFileRoute("/")({
  validateSearch: z.object({
    q: z.string().trim().optional().catch(undefined),
  }),
  component: Home,
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ deps }) => {
    if (deps.q !== undefined) {
      return {
        data: brotliDecompress(decodeBase64Url(deps.q)) ?? undefined,
      };
    }
    return {};
  },
});

export { Route };
