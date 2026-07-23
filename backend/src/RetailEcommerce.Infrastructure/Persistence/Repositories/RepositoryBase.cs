using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using RetailEcommerce.Application.Interfaces.Repositories;
using RetailEcommerce.Domain.Common;

namespace RetailEcommerce.Infrastructure.Persistence.Repositories;

/// <summary>Generic EF Core repository. Soft-deleted rows are excluded via the model query filter.</summary>
public abstract class RepositoryBase<T> : IRepository<T> where T : AuditableEntity
{
    protected readonly ApplicationDbContext Context;
    protected readonly DbSet<T> Set;

    protected RepositoryBase(ApplicationDbContext context)
    {
        Context = context;
        Set = context.Set<T>();
    }

    // Tracked: callers may mutate the returned entity.
    public virtual Task<T?> GetByIdAsync(int id, CancellationToken ct = default) =>
        Set.FirstOrDefaultAsync(e => e.Id == id, ct);

    public virtual async Task<IReadOnlyList<T>> ListAllAsync(CancellationToken ct = default) =>
        await Set.AsNoTracking().ToListAsync(ct);

    public virtual async Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default) =>
        await Set.AsNoTracking().Where(predicate).ToListAsync(ct);

    public virtual Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default) =>
        Set.AnyAsync(predicate, ct);

    public virtual async Task AddAsync(T entity, CancellationToken ct = default) =>
        await Set.AddAsync(entity, ct);

    public virtual void Update(T entity) => Set.Update(entity);

    public virtual void Remove(T entity) => Set.Remove(entity);
}
