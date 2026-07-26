import { deleteMessageAction } from "./actions";
import styles from "./inbox.module.css";

export function DeleteDialog({ id, name }: Readonly<{ id: string; name: string }>) {
  async function deleteAction(): Promise<void> {
    "use server";

    await deleteMessageAction(id);
  }

  return (
    <form action={deleteAction} className={styles.deleteForm}>
      <button type="submit">Delete message from {name}</button>
    </form>
  );
}
