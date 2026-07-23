namespace RetailEcommerce.Application.Common;

/// <summary>Base paging/sorting parameters shared by list endpoints.</summary>
public abstract class PagedQuery
{
    private const int MaxPageSize = 100;
    private int _pageSize = 20;
    private int _page = 1;

    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value is < 1 or > MaxPageSize ? 20 : value;
    }

    /// <summary>Free-text search term.</summary>
    public string? Search { get; set; }

    /// <summary>Field to sort by (interpreted by the repository).</summary>
    public string? SortBy { get; set; }

    public bool SortDescending { get; set; }

    public int Skip => (Page - 1) * PageSize;
}

/// <summary>Filtering options for the product catalogue.</summary>
public class ProductQuery : PagedQuery
{
    public int? CategoryId { get; set; }
    public int? BrandId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsFeatured { get; set; }
}

/// <summary>Filtering options for orders (admin + customer views).</summary>
public class OrderQuery : PagedQuery
{
    public Domain.Enums.OrderStatus? Status { get; set; }
    public Guid? CustomerId { get; set; }
}
