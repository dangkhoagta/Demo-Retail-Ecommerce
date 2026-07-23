namespace RetailEcommerce.Application.Interfaces.Repositories;

/// <summary>Commits all pending changes tracked by the repositories in a single transaction.</summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
