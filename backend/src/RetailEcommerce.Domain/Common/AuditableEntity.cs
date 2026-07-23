namespace RetailEcommerce.Domain.Common;

/// <summary>
/// Base type for all persisted domain entities. Carries the audit fields
/// (created/updated by whom and when) plus soft-delete markers. These values
/// are populated automatically by the audit SaveChanges interceptor in the
/// Infrastructure layer, so application/domain code never sets them by hand.
/// </summary>
public abstract class AuditableEntity
{
    public int Id { get; set; }

    // Audit fields
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
