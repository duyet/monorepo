import type { RunnableConfig } from "@langchain/core/runnables";
import {
  BaseCheckpointSaver,
  type Checkpoint,
  type CheckpointMetadata,
  type CheckpointTuple,
  type PendingWrite,
} from "@langchain/langgraph-checkpoint";

export class DurableObjectSaver extends BaseCheckpointSaver {
  constructor(private stub: DurableObjectStub) {
    super();
  }

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    const threadId = config.configurable?.thread_id;
    const checkpointId = config.configurable?.checkpoint_id;
    const checkpointNs = config.configurable?.checkpoint_ns ?? "";

    const res = await this.stub.fetch(
      new Request("https://durable-store/get", {
        method: "POST",
        body: JSON.stringify({ threadId, checkpointNs, checkpointId }),
        headers: { "Content-Type": "application/json" },
      })
    );

    if (!res.ok) return undefined;

    const data = (await res.json()) as any;
    if (!data?.checkpoint) return undefined;

    return {
      config: {
        configurable: {
          thread_id: data.thread_id,
          checkpoint_ns: data.checkpoint_ns,
          checkpoint_id: data.checkpoint_id,
        },
      },
      checkpoint: await this.serde.loadsTyped("json", data.checkpoint),
      metadata: await this.serde.loadsTyped("json", data.metadata),
      parentConfig: data.parent_checkpoint_id
        ? {
            configurable: {
              thread_id: data.thread_id,
              checkpoint_ns: data.checkpoint_ns,
              checkpoint_id: data.parent_checkpoint_id,
            },
          }
        : undefined,
    };
  }

  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata
  ): Promise<RunnableConfig> {
    const threadId = config.configurable?.thread_id;
    const checkpointId = checkpoint.id;
    const checkpointNs = config.configurable?.checkpoint_ns ?? "";
    const parentCheckpointId = config.configurable?.checkpoint_id;

    const [, checkpointBytes] = await this.serde.dumpsTyped(checkpoint);
    const [, metadataBytes] = await this.serde.dumpsTyped(metadata);

    const serializedCheckpoint = new TextDecoder().decode(checkpointBytes);
    const serializedMetadata = new TextDecoder().decode(metadataBytes);

    await this.stub.fetch(
      new Request("https://durable-store/put", {
        method: "POST",
        body: JSON.stringify({
          threadId,
          checkpointNs,
          checkpointId,
          parentCheckpointId,
          checkpoint: serializedCheckpoint,
          metadata: serializedMetadata,
        }),
        headers: { "Content-Type": "application/json" },
      })
    );

    return {
      configurable: {
        thread_id: threadId,
        checkpoint_ns: checkpointNs,
        checkpoint_id: checkpointId,
      },
    };
  }

  async putWrites(
    config: RunnableConfig,
    writes: PendingWrite[],
    taskId: string
  ): Promise<void> {
    const threadId = config.configurable?.thread_id;
    const checkpointId = config.configurable?.checkpoint_id;
    const checkpointNs = config.configurable?.checkpoint_ns ?? "";

    const serializedWrites = await Promise.all(
      writes.map(async ([channel, value]) => {
        const [, valueBytes] = await this.serde.dumpsTyped(value);
        return {
          channel,
          value: new TextDecoder().decode(valueBytes),
        };
      })
    );

    await this.stub.fetch(
      new Request("https://durable-store/putWrites", {
        method: "POST",
        body: JSON.stringify({
          threadId,
          checkpointNs,
          checkpointId,
          taskId,
          writes: serializedWrites,
        }),
        headers: { "Content-Type": "application/json" },
      })
    );
  }

  async *list(
    config: RunnableConfig,
    options?: any
  ): AsyncGenerator<CheckpointTuple> {
    const threadId = config.configurable?.thread_id;
    const checkpointNs = config.configurable?.checkpoint_ns ?? "";

    const res = await this.stub.fetch(
      new Request("https://durable-store/list", {
        method: "POST",
        body: JSON.stringify({ threadId, checkpointNs, options }),
        headers: { "Content-Type": "application/json" },
      })
    );

    if (!res.ok) return;

    const { list } = (await res.json()) as any;
    for (const item of list) {
      yield {
        config: {
          configurable: {
            thread_id: item.thread_id,
            checkpoint_ns: item.checkpoint_ns,
            checkpoint_id: item.checkpoint_id,
          },
        },
        checkpoint: await this.serde.loadsTyped("json", item.checkpoint),
        metadata: await this.serde.loadsTyped("json", item.metadata),
        parentConfig: item.parent_checkpoint_id
          ? {
              configurable: {
                thread_id: item.thread_id,
                checkpoint_ns: item.checkpoint_ns,
                checkpoint_id: item.parent_checkpoint_id,
              },
            }
          : undefined,
      };
    }
  }

  async deleteThread(threadId: string): Promise<void> {
    if (!threadId) return;

    await this.stub.fetch(
      new Request("https://durable-store/delete", {
        method: "POST",
        body: JSON.stringify({ threadId }),
        headers: { "Content-Type": "application/json" },
      })
    );
  }
}
