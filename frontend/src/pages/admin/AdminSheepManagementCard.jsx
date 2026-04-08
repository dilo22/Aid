import Loader from "../../components/ui/Loader";
import StatusBadge from "../../components/ui/StatusBadge";
import { SHEEP_SIZES, SHEEP_STATUSES } from "../../constants/sheep";
import "../../styles/AdminSheepCard.css";

export default function AdminSheepManagementCard({
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
  sizeOptions,   // SHEEP_SIZES — tableau {value, label}
  colorOptions,  // tableau de strings
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
  const isLoading = loading || profilesLoading;

  return (
    <div className="sheep-card">

      {/* HEADER */}
      <div className="sheep-header">
        <div>
          <h1 className="sheep-title">Gestion des moutons</h1>
          <p className="sheep-subtitle">
            Suivi, attribution, prix, réduction et paiement.
          </p>
        </div>
        <div className="sheep-header-actions">
          <button onClick={onRefresh}     className="btn-secondary">Actualiser</button>
          <button onClick={onOpenCreate}  className="btn-primary">+ Nouveau mouton</button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="sheep-toolbar">
        <input
          type="text"
          placeholder="Rechercher par numéro, couleur, fidèle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sheep-input"
          style={{ flex: 2, minWidth: 200 }}
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sheep-input">
          <option value="all">Tous les statuts</option>
          {/* ✅ Depuis SHEEP_STATUSES pour cohérence */}
          {SHEEP_STATUSES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* ✅ sizeOptions = SHEEP_SIZES = [{value, label}] */}
        <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className="sheep-input">
          <option value="all">Toutes les tailles</option>
          {sizeOptions.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)} className="sheep-input">
          <option value="all">Toutes les couleurs</option>
          {colorOptions.map((color) => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sheep-input">
          <option value="recent">Plus récents</option>
          <option value="number_asc">Numéro A → Z</option>
          <option value="number_desc">Numéro Z → A</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
        </select>
      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <form onSubmit={onSubmit} className="sheep-form">
          <div className="sheep-form-grid">
            <label className="sheep-label">
              Numéro *
              <input name="number" value={form.number} onChange={onChange}
                placeholder="Numéro du mouton" required className="sheep-input" />
            </label>

            <label className="sheep-label">
              URL photo
              <input name="photo_url" value={form.photo_url} onChange={onChange}
                placeholder="https://..." className="sheep-input" />
            </label>

            <label className="sheep-label">
              Poids (kg)
              <input name="weight" type="number" value={form.weight} onChange={onChange}
                placeholder="Poids"  className="sheep-input" />
            </label>

            <label className="sheep-label">
              Prix initial (€)
              <input name="price" type="number" value={form.price} onChange={onChange}
                placeholder="Prix" min="0" step="0.01" className="sheep-input" />
            </label>

            <label className="sheep-label">
              Réduction (€)
              <input name="discount_amount" type="number" value={form.discount_amount} onChange={onChange}
                placeholder="Réduction" min="0" step="0.01" className="sheep-input" />
            </label>

            <label className="sheep-label">
              Prix final (€)
              <input name="final_price" type="number" value={form.final_price} onChange={onChange}
                placeholder="Prix final" min="0" step="0.01" className="sheep-input" />
            </label>

            {/* ✅ Labels français depuis SHEEP_SIZES */}
            <label className="sheep-label">
              Taille
              <select name="size" value={form.size} onChange={onChange} className="sheep-input">
                <option value="">Sélectionner</option>
                {SHEEP_SIZES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className="sheep-label">
              Couleur
              <input name="color" value={form.color} onChange={onChange}
                placeholder="Couleur" className="sheep-input" />
            </label>

            <label className="sheep-label">
              Statut
              <select name="status" value={form.status} onChange={onChange} className="sheep-input">
                {SHEEP_STATUSES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className="sheep-label">
              Échéance paiement
              <input name="payment_due_date" type="datetime-local"
                value={form.payment_due_date} onChange={onChange} className="sheep-input" />
            </label>

            <label className="sheep-label">
              Notes paiement
              <textarea name="payment_notes" value={form.payment_notes} onChange={onChange}
                placeholder="Notes paiement" className="sheep-textarea" />
            </label>

            <label className="sheep-label sheep-form-full">
              Notes mouton
              <textarea name="notes" value={form.notes} onChange={onChange}
                placeholder="Notes" className="sheep-textarea" />
            </label>
          </div>

          <div className="sheep-form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Enregistrement..." : editingId ? "Enregistrer les modifications" : "Créer le mouton"}
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      {/* TABLE */}
      <div className="sheep-table-wrap">
        <table className="sheep-table">
          <thead>
            <tr>
              <th className="sheep-th">Mouton</th>
              <th className="sheep-th">Poids</th>
              <th className="sheep-th">Prix</th>
              <th className="sheep-th">Taille</th>
              <th className="sheep-th">Couleur</th>
              <th className="sheep-th">Statut</th>
              <th className="sheep-th">Fidèle attribué</th>
              <th className="sheep-th">Ajouté le</th>
              <th className="sheep-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="sheep-loading-cell">
                  <Loader small />
                  <div>Chargement des données...</div>
                </td>
              </tr>
            ) : filteredSheep.length === 0 ? (
              <tr>
                <td colSpan={9} className="sheep-empty">Aucun mouton trouvé.</td>
              </tr>
            ) : (
              filteredSheep.map((item) => {
                const realStatus  = getRealSheepStatus(item);
                const assignedName = getAssignedProfileName(item);

                return (
                  <tr key={item.id} className="sheep-row" onClick={() => onRowClick(item)}>
                    <td className="sheep-td">
                      <div className="sheep-cell">
                        <div className="sheep-avatar">🐏</div>
                        <div>
                          <div className="sheep-number">#{item.number || "-"}</div>
                          <div className="sheep-meta">{item.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="sheep-td">{formatWeight(item.weight)}</td>
                    <td className="sheep-td">{formatPrice(item.price)}</td>
                    {/* ✅ Label français depuis SHEEP_SIZES */}
                    <td className="sheep-td">
                      {SHEEP_SIZES.find((s) => s.value === item.size)?.label || item.size || "-"}
                    </td>
                    <td className="sheep-td">{item.color || "-"}</td>
                    <td className="sheep-td">
                      {/* ✅ StatusBadge réutilisé */}
                      <StatusBadge status={realStatus} />
                    </td>
                    <td className="sheep-td">{assignedName}</td>
                    <td className="sheep-td">{formatDate(item.created_at)}</td>
                    <td className="sheep-td">
                      <div className="sheep-actions">
                        <button type="button" className="sheep-btn-icon sheep-btn-icon--edit"
                          onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                          title="Modifier" aria-label="Modifier">✏️</button>
                        <button type="button" className="sheep-btn-icon sheep-btn-icon--delete"
                          onClick={(e) => { e.stopPropagation(); onDelete(item.id, item.number); }}
                          disabled={deletingId === item.id}
                          title="Supprimer" aria-label="Supprimer">
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