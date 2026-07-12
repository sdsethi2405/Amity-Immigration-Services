export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export function actionOk<T = undefined>(data?: T): ActionResult<T> {
  return data === undefined
    ? { success: true }
    : { success: true, data };
}

export function actionFail(error: string): ActionResult<never> {
  return { success: false, error };
}
