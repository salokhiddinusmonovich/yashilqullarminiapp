// Редактирование анкеты, фото и пароля для сайта.
import { useRef, useState } from "preact/hooks";
import type { Bootstrap, ProfilePatch } from "../types";
import { t, type Key } from "../i18n";
import { api } from "../api";
import { Avatar, Icon, Sheet } from "../ui";
import { haptic, requestPhone, tg } from "../tg";

type Errors = Partial<Record<keyof ProfilePatch, string>>;

export function EditProfile({ data, open, onClose, onSaved }: {
  data: Bootstrap; open: boolean; onClose: () => void; onSaved: (d: Bootstrap) => void;
}) {
  const u = data.user;
  const [f, setF] = useState<ProfilePatch>({
    fullname: u.fullname, region: u.region ?? "", phone: u.phone ?? "", email: u.email ?? "",
    age: u.age, education_place: u.education_place ?? "", experience: u.experience ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState<"" | "save" | "photo">("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof ProfilePatch) => (e: Event) => {
    setF({ ...f, [k]: (e.target as HTMLInputElement).value });
    setErrors({ ...errors, [k]: undefined });
  };

  async function save() {
    setBusy("save");
    try {
      const d = await api.saveProfile({ ...f, age: f.age === ("" as unknown) ? null : f.age });
      haptic("success");
      onSaved(d);
      onClose();
    } catch (e) {
      haptic("error");
      const body = (e as { body?: { errors?: Errors } }).body;
      if (body?.errors) setErrors(body.errors);
    } finally {
      setBusy("");
    }
  }

  async function pickPhoto(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    setBusy("photo");
    try {
      onSaved(await api.uploadPhoto(file));
      haptic("success");
    } catch {
      haptic("error");
    } finally {
      setBusy("");
    }
  }

  async function phoneFromTelegram() {
    const p = await requestPhone();
    if (p) { setF({ ...f, phone: p }); haptic("success"); }
  }

  const err = (k: keyof ProfilePatch) => errors[k] && <span class="field-err">{t(`err_${errors[k]}` as Key)}</span>;

  return (
    <Sheet open={open} onClose={onClose}>
      <div class="sheet-pad">
        <span class="mono label-xs">{t("passport").toUpperCase()} · {t("edit").toUpperCase()}</span>
        <h2 class="sheet-title plain">{t("editTitle")}</h2>

        <button class="photo-pick tap" onClick={() => fileRef.current?.click()} disabled={busy === "photo"}>
          <div class="pp-photo"><Avatar src={u.photo} name={u.fullname} size={72} /></div>
          <span><Icon.camera />{busy === "photo" ? t("saving") : t("changePhoto")}</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />

        <label class="field">
          <span>{t("fName")}</span>
          <input value={f.fullname} onInput={set("fullname")} autocomplete="name" />
          {err("fullname")}
        </label>
        <label class="field">
          <span>{t("fRegion")}</span>
          <select value={f.region ?? ""} onChange={set("region")}>
            <option value="" disabled>—</option>
            {data.regions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
          {err("region")}
        </label>
        <label class="field">
          <span>{t("fPhone")}</span>
          <div class="field-row">
            <input value={f.phone ?? ""} onInput={set("phone")} inputMode="tel" placeholder="+998 90 123 45 67" />
            {tg?.requestContact && (
              <button type="button" class="chip-btn tap" onClick={phoneFromTelegram}>{t("fromTg")}</button>
            )}
          </div>
          {err("phone")}
        </label>
        <label class="field">
          <span>{t("fEmail")}</span>
          <input value={f.email ?? ""} onInput={set("email")} inputMode="email" autocomplete="email" placeholder="name@mail.uz" />
          {err("email")}
        </label>
        <div class="field-2">
          <label class="field">
            <span>{t("fAge")}</span>
            <input value={f.age ?? ""} onInput={set("age")} inputMode="numeric" />
            {err("age")}
          </label>
          <label class="field">
            <span>{t("fEdu")}</span>
            <input value={f.education_place ?? ""} onInput={set("education_place")} />
          </label>
        </div>
        <label class="field">
          <span>{t("fExp")}</span>
          <textarea rows={3} value={f.experience ?? ""} onInput={set("experience")} />
        </label>
      </div>
      <div class="sheet-actions">
        <button class="btn btn-primary tap" onClick={save} disabled={busy === "save"}>
          {busy === "save" ? <span class="spin" /> : <Icon.check />}
          {busy === "save" ? t("saving") : t("save")}
        </button>
      </div>
    </Sheet>
  );
}

export function PasswordSheet({ data, open, onClose, onSaved }: {
  data: Bootstrap; open: boolean; onClose: () => void; onSaved: (d: Bootstrap) => void;
}) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (pw.length < 8) { setErr(true); haptic("warning"); return; }
    setBusy(true);
    try {
      onSaved(await api.setPassword(pw));
      haptic("success");
      setPw("");
      onClose();
    } catch {
      haptic("error");
      setErr(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div class="sheet-pad">
        <span class="mono label-xs">yashilqollar.uz</span>
        <h2 class="sheet-title plain">{t("pwTitle")}</h2>
        <p class="muted">{t("pwHint", { email: data.user.email ?? "" })}</p>
        <label class="field">
          <span>{t("fEmail")}</span>
          <input value={data.user.email ?? ""} disabled />
        </label>
        <label class="field">
          <span><Icon.lock /> Password</span>
          <input type="password" value={pw} autocomplete="new-password"
            onInput={(e) => { setPw((e.target as HTMLInputElement).value); setErr(false); }} />
          {err && <span class="field-err">{t("pwShort")}</span>}
        </label>
      </div>
      <div class="sheet-actions">
        <button class="btn btn-primary tap" onClick={save} disabled={busy}>
          {busy ? <span class="spin" /> : <Icon.lock />}{t("save")}
        </button>
      </div>
    </Sheet>
  );
}
