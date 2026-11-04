"use client";
import { startTransition, type FormEvent } from "react";

// React 19 clears uncontrolled fields once a <form action={fn}> finishes, even when the
// action only returned a validation error. Submitting through onSubmit + preventDefault
// keeps what the person typed (selects, checkboxes, chosen files too). Keep `action` on the
// <form> as well so it still posts before hydration.
export function keepInput(dispatch: (form: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const data = new FormData(e.currentTarget, submitter instanceof HTMLElement ? submitter : null);
    startTransition(() => dispatch(data));
  };
}
