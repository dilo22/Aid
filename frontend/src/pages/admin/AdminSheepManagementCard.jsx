import Loader from "../../components/ui/Loader";

export default function AdminSheepManagementCard({
  styles,
  loading,
  profilesLoading,
  saving,
  deletingId,
  showForm,
  editingId,
  form,
  search,
  statusFilter,
  sizeFilter,
  colorFilter,
  sortBy,
  sizeOptions,
  colorOptions,
  filteredSheep,
  onRefresh,
  onOpenCreate,
  onChange,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
  onRowClick,
  setSearch,
  setStatusFilter,
  setSizeFilter,
  setColorFilter,
  setSortBy,
  getRealSheepStatus,
  getStatusTheme,
  getAssignedProfileName,
  formatPrice,
  formatWeight,
  formatDate,
}) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>Gestion des moutons</h1>
          <p style={styles.subtitle}>
            Suivi des moutons, attribution, photo, prix, réduction et paiement.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={onRefresh} style={styles.secondaryButton}>
            Actualiser
          </button>
          <button onClick={onOpenCreate} style={styles.primaryButton}>
            + Nouveau mouton
          </button>
        </div>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.toolbarRow}>
          <input
            type="text"
            placeholder="Rechercher par numéro, statut, taille, couleur, fidèle, paiement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.input}
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="assigned">Attribué</option>
            <option value="sacrificed">Sacrifié</option>
            <option value="missing">Manquant</option>
          </select>

          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            style={styles.input}
          >
            <option value="all">Toutes les tailles</option>
            {sizeOptions
              .filter((value) => value !== "all")
              .map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
          </select>

          <select
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            style={styles.input}
          >
            <option value="all">Toutes les couleurs</option>
            {colorOptions
              .filter((value) => value !== "all")
              .map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.input}
          >
            <option value="recent">Plus récents</option>
            <option value="number_asc">Numéro A → Z</option>
            <option value="number_desc">Numéro Z → A</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <label style={styles.label}>
              Numéro
              <input
                name="number"
                value={form.number}
                onChange={onChange}
                placeholder="Numéro du mouton"
                required
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              URL photo
              <input
                name="photo_url"
                value={form.photo_url}
                onChange={onChange}
                placeholder="https://..."
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Poids
              <input
                name="weight"
                type="number"
                value={form.weight}
                onChange={onChange}
                placeholder="Poids"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Prix initial
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={onChange}
                placeholder="Prix"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Réduction
              <input
                name="discount_amount"
                type="number"
                value={form.discount_amount}
                onChange={onChange}
                placeholder="Réduction"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Prix final
              <input
                name="final_price"
                type="number"
                value={form.final_price}
                onChange={onChange}
                placeholder="Prix final"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Taille
              <select
                name="size"
                value={form.size}
                onChange={onChange}
                style={styles.input}
              >
                <option value="">Sélectionner</option>
                <option value="small">small</option>
                <option value="medium">medium</option>
                <option value="large">large</option>
              </select>
            </label>

            <label style={styles.label}>
              Couleur
              <input
                name="color"
                value={form.color}
                onChange={onChange}
                placeholder="Couleur"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Statut du mouton
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                style={styles.input}
              >
                <option value="available">Disponible</option>
                <option value="assigned">Attribué</option>
                <option value="sacrificed">Sacrifié</option>
                <option value="missing">Manquant</option>
              </select>
            </label>

            

            <label style={styles.label}>
              Échéance paiement
              <input
                name="payment_due_date"
                type="datetime-local"
                value={form.payment_due_date}
                onChange={onChange}
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Notes paiement
              <textarea
                name="payment_notes"
                value={form.payment_notes}
                onChange={onChange}
                placeholder="Notes paiement"
                style={styles.textarea}
              />
            </label>
          </div>

          <label style={styles.label}>
            Notes mouton
            <textarea
              name="notes"
              value={form.notes}
              onChange={onChange}
              placeholder="Notes"
              style={styles.textarea}
            />
          </label>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              style={styles.primaryButton}
              disabled={saving}
            >
              {saving
                ? "Enregistrement..."
                : editingId
                ? "Enregistrer les modifications"
                : "Créer le mouton"}
            </button>

            <button
              type="button"
              onClick={onCancel}
              style={styles.secondaryButton}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Mouton</th>
              <th style={styles.th}>Poids</th>
              <th style={styles.th}>Prix</th>
              <th style={styles.th}>Taille</th>
              <th style={styles.th}>Couleur</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Fidèle attribué</th>
              <th style={styles.th}>Ajouté le</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading || profilesLoading ? (
              <tr>
                <td colSpan={9}>
                  <Loader small={true} />
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "0.9rem",
                      color: "#232121",
                    }}
                  >
                    Chargement des données...
                  </div>
                </td>
              </tr>
            ) : filteredSheep.length === 0 ? (
              <tr>
                <td colSpan={9} style={styles.empty}>
                  Aucun mouton trouvé.
                </td>
              </tr>
            ) : (
              filteredSheep.map((item) => {
                const statusTheme = getStatusTheme(getRealSheepStatus(item));
                const assignedProfileName = getAssignedProfileName(item);

                return (
                  <tr
                    key={item.id}
                    style={styles.clickableRow}
                    onClick={() => onRowClick(item)}
                  >
                    <td style={styles.td}>
                      <div style={styles.sheepCell}>
                        <div style={styles.sheepAvatar}>🐏</div>
                        <div style={styles.sheepNameBlock}>
                          <span style={styles.sheepNumber}>
                            Mouton #{item.number || "-"}
                          </span>
                          <span style={styles.sheepMeta}>ID : {item.id}</span>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>{formatWeight(item.weight)}</td>
                    <td style={styles.td}>{formatPrice(item.price)}</td>
                    <td style={styles.td}>{item.size || "-"}</td>
                    <td style={styles.td}>{item.color || "-"}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badgeBase,
                          background: statusTheme.background,
                          color: statusTheme.color,
                          border: statusTheme.border,
                        }}
                      >
                        {statusTheme.label}
                      </span>
                    </td>
                    <td style={styles.td}>{assignedProfileName}</td>
                    <td style={styles.td}>{formatDate(item.created_at)}</td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}
                          style={styles.editIconButton}
                          title="Modifier"
                          aria-label="Modifier"
                          type="button"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id, item.number);
                          }}
                          style={styles.deleteIconButton}
                          disabled={deletingId === item.id}
                          title="Supprimer"
                          aria-label="Supprimer"
                          type="button"
                        >
                          {deletingId === item.id ? "…" : "🗑️"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}