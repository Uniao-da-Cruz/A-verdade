import { motion } from "framer-motion";

const baseActionClass =
  "group flex w-full items-start gap-3 rounded-none border px-4 py-3 text-left transition-colors";

export const ExternalWatchSection = ({
  icon: Icon,
  title,
  description,
  iconClassName,
  wrapperClassName,
  sectionTestId,
  gridClassName = "grid grid-cols-1 md:grid-cols-2 gap-3",
  actions,
  footer,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={wrapperClassName}
      data-testid={sectionTestId}
    >
      <div className="flex items-start gap-4">
        <Icon className={`mt-1 h-6 w-6 flex-shrink-0 ${iconClassName}`} />
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <h3 className="font-chivo text-lg font-bold" data-testid={`${sectionTestId}-title`}>
              {title}
            </h3>
            <p className="text-sm text-zinc-400" data-testid={`${sectionTestId}-description`}>
              {description}
            </p>
          </div>

          <div className={gridClassName}>
            {actions.map((action) => {
              const ActionIcon = action.icon;

              if (action.onClick) {
                return (
                  <button
                    key={action.testId}
                    type="button"
                    onClick={action.onClick}
                    className={`${baseActionClass} ${action.className}`}
                    data-testid={action.testId}
                  >
                    <ActionIcon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${action.iconClassName}`} />
                    <div className="space-y-1">
                      <p className={`text-xs font-mono uppercase ${action.labelClassName}`}>{action.label}</p>
                      {action.description ? (
                        <p className="text-xs text-zinc-500">{action.description}</p>
                      ) : null}
                    </div>
                  </button>
                );
              }

              return (
                <a
                  key={action.testId}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${baseActionClass} ${action.className}`}
                  data-testid={action.testId}
                >
                  <ActionIcon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${action.iconClassName}`} />
                  <div className="space-y-1">
                    <p className={`text-xs font-mono uppercase ${action.labelClassName}`}>{action.label}</p>
                    {action.description ? (
                      <p className="text-xs text-zinc-500">{action.description}</p>
                    ) : null}
                  </div>
                </a>
              );
            })}
          </div>

          {footer ? (
            <div className="border border-white/10 bg-zinc-900/50 p-3" data-testid={`${sectionTestId}-footer`}>
              <p className="text-xs font-mono text-zinc-500">{footer}</p>
            </div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
};