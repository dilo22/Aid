// ✅ Dans getSheepList — plafonner le limit et filtrer par organisation
export const getSheepList = async (req, res, next) => {
  try {
    const {
      search = "", status = "", size = "", color = "",
      sortBy = "created_at", sortOrder = "desc",
      page = 1, limit = 10,
    } = req.query;

    const parsedPage  = Math.max(parseInt(page,  10) || 1,  1);
    // ✅ Limite max à 100 pour éviter les requêtes massives
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const from = (parsedPage - 1) * parsedLimit;
    const to   = from + parsedLimit - 1;

    const safeSortBy    = ALLOWED_SORT_FIELDS.includes(sortBy)    ? sortBy    : "created_at";
    const safeSortOrder = ALLOWED_SORT_ORDERS.includes(sortOrder) ? sortOrder : "desc";

    let query = supabase.from("sheep").select("*", { count: "exact" });

    // ✅ Filtrage par organisation si l'user n'est pas admin
    if (req.user.role !== "admin" && req.user.organization_id) {
      query = query.eq("organization_id", req.user.organization_id);
    }

    if (search) query = query.ilike("number", `%${search}%`);
    if (status) query = query.eq("status", status);
    if (size)   query = query.eq("size", size);
    if (color)  query = query.eq("color", color);

    query = query.order(safeSortBy, { ascending: safeSortOrder === "asc" }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("[GET_SHEEP_LIST]", error);
      throw new ApiError(500, "Erreur serveur");
    }

    res.json({
      items: data || [],
      meta: { total: count || 0, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil((count || 0) / parsedLimit) || 1 },
    });
  } catch (error) {
    next(error);
  }
};

// ✅ deleteSheep — soft delete au lieu de suppression physique
export const deleteSheep = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) throw new ApiError(400, "ID du mouton manquant");

    const { data: sheep } = await supabase
      .from("sheep").select("status").eq("id", id).maybeSingle();

    if (!sheep) throw new ApiError(404, "Mouton introuvable");

    // ✅ Bloquer la suppression si assigné ou sacrifié
    if (["assigned", "sacrificed"].includes(sheep.status)) {
      throw new ApiError(400, "Impossible de supprimer un mouton assigné ou sacrifié");
    }

    const { data, error } = await supabase
      .from("sheep")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, number")
      .single();

    if (error) {
      console.error("[DELETE_SHEEP]", error);
      throw new ApiError(500, "Erreur serveur");
    }

    res.json({ message: "Mouton supprimé avec succès", item: data });
  } catch (error) {
    next(error);
  }
};

// ✅ assignSheep — supprimer l'erreur intentionnelle, route à désactiver proprement
export const assignSheep = async (req, res, next) => {
  next(new ApiError(501, "Fonctionnalité non disponible"));
};